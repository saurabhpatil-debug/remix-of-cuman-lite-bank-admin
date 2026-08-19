export interface ClientPowerBiReportResponseVM {
	clientPowerBiReportMappingId: number;
	displayName: string;
	tab: string;
	balanceSheetDate: string;
	comments: string;
	pdf: string | null;
	fileSize: string | null;
	updated: string;
	rowVersion: string;
	artifactType: string;
	clientTabId: number;
	artifactTypeId: number;
	pageNo: number;
	pageSize: number;
	totalRecords: number;
}
