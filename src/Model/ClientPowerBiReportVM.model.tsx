export interface ClientPowerBiReportVM {
	clientPowerBiReportMappingId: number;
	displayName: string;
	clientTabsId: number;
	balanceSheetDate: string;
	comments: string;
	pdfURL: string;
	fileSize: string;
	artifactTypeId: number;
	rowVersion?: string | Uint8Array | number[];
}
