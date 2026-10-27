import abc
import logging
from typing import Tuple, Optional, Dict
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

# Test-only storage for capturing OTPs during automated tests
_test_captured_otps: Dict[str, str] = {}


def get_test_captured_otp(phone_number: str) -> Optional[str]:
    """Test helper to retrieve the last captured OTP in test mode."""
    return _test_captured_otps.get(phone_number.strip())


def clear_test_captured_otps() -> None:
    """Test helper to clear test captured OTPs."""
    _test_captured_otps.clear()


class BaseSMSProvider(abc.ABC):
    """Abstract base class for SMS delivery providers."""

    @abc.abstractmethod
    def send_otp(self, phone_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        """
        Sends a 6-digit OTP to the recipient phone number.
        Returns:
            (success: bool, error_message: Optional[str])
        """
        pass


class TwilioSMSProvider(BaseSMSProvider):
    """
    Twilio REST API SMS delivery provider.
    Uses standard HTTP Basic Authentication with Account SID and Auth Token.
    """

    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID.strip()
        self.auth_token = settings.TWILIO_AUTH_TOKEN.strip()
        self.from_number = settings.TWILIO_FROM_NUMBER.strip()

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.auth_token and self.from_number)

    def send_otp(self, phone_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        if not self.is_configured():
            return False, "Twilio SMS provider is not configured. Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER."

        # Normalize phone number to E.164 format (+91 for 10-digit Indian numbers)
        normalized = phone_number.strip()
        if len(normalized) == 10 and normalized.isdigit():
            e164_phone = f"+91{normalized}"
        elif normalized.startswith("+"):
            e164_phone = normalized
        else:
            e164_phone = f"+{normalized}"

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        data = {
            "To": e164_phone,
            "From": self.from_number,
            "Body": f"Your AgriVision verification code is: {otp}. It is valid for 5 minutes. Do not share this code.",
        }

        try:
            response = requests.post(
                url,
                data=data,
                auth=(self.account_sid, self.auth_token),
                timeout=10,
            )

            if response.status_code in [200, 201]:
                # Log without exposing raw OTP or full phone number
                masked_phone = f"***{normalized[-4:]}" if len(normalized) >= 4 else "***"
                logger.info(f"Twilio SMS OTP dispatched successfully to {masked_phone}.")
                return True, None
            else:
                err_detail = response.text[:200]
                logger.error(f"Twilio SMS delivery failed with status {response.status_code}: {err_detail}")
                return False, f"SMS delivery failed ({response.status_code}): {err_detail}"

        except requests.exceptions.Timeout:
            logger.error("Twilio SMS request timed out.")
            return False, "SMS provider timed out. Please try requesting OTP again."
        except Exception as ex:
            logger.error(f"Twilio SMS delivery exception: {ex}")
            return False, f"SMS delivery service error: {str(ex)}"


class MockTestSMSProvider(BaseSMSProvider):
    """
    Mock SMS provider for development and automated testing.
    Captures OTPs in an internal test registry without sending external network requests.
    """

    def send_otp(self, phone_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        clean_phone = phone_number.strip()
        _test_captured_otps[clean_phone] = otp

        masked = f"***{clean_phone[-4:]}" if len(clean_phone) >= 4 else "***"
        logger.info(f"[AgriVision Mock SMS] OTP recorded for {masked}.")

        # In local development mode, print securely to backend console so developer can test
        if settings.DEMO_MODE:
            print(f"[AgriVision SMS Dev] OTP for {clean_phone}: {otp}")

        return True, None


class ConsoleSMSProvider(BaseSMSProvider):
    """
    Console logging SMS provider for local testing and developer environments.
    """

    def send_otp(self, phone_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        clean_phone = phone_number.strip()
        _test_captured_otps[clean_phone] = otp
        print(f"[AgriVision SMS Console] OTP for {clean_phone}: {otp}")
        return True, None


def get_sms_provider() -> BaseSMSProvider:
    """Returns the active SMS provider instance based on settings."""
    provider_name = settings.SMS_PROVIDER.strip().lower()

    if provider_name == "twilio":
        return TwilioSMSProvider()
    elif provider_name == "console":
        return ConsoleSMSProvider()
    else:
        return MockTestSMSProvider()
