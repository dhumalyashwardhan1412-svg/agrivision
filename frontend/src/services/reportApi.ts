import api from './api';

export interface FarmReportSummary {
  report_id: string;
  generated_at: string;
  farm_name: string;
  farmer_name: string;
  location: string;
  total_area_acres: number;
  soil_health_grade: string;
  top_recommended_crop: string;
  projected_net_profit_inr: number;
  projected_roi_percent: number;
  pdf_download_url: string;
}

export const reportApi = {
  getReportSummary: async (farmId: number): Promise<FarmReportSummary> => {
    const res = await api.get<FarmReportSummary>(`/reports/summary/${farmId}`);
    return res.data;
  },

  downloadFarmPdf: async (farmId: number): Promise<Blob> => {
    const res = await api.get(`/reports/farm-pdf/${farmId}`, {
      responseType: 'blob'
    });
    return res.data;
  },

  downloadFarmReportPDF: async (farmId: number): Promise<void> => {
    const res = await api.get(`/reports/farm-pdf/${farmId}`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriVision_Farm_Report_${farmId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
