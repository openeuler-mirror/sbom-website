import http from "@/http-common";
import { SERVER_API_HOST } from "@/http-common";
import { ResponseType, AxiosRequestConfig } from "axios";
class SbomDataService {
  queryProductType(): Promise<any> {
    return http({
      url: `/queryProductType`,
      method: "get",
      headers: {
        hideLoading: true,
      },
    });
  }

  queryProductConfig(productType: string): Promise<any> {
    return http({
      url: `/queryProductConfig/${productType}`,
      method: "get",
      headers: {
        hideLoading: true,
      },
    });
  }

  queryProduct(productType: string, data: any): Promise<any> {
    return http.post(`/queryProduct/${productType}`, data);
  }

  querySbomPackagesByPageable(data: any): Promise<any> {
    return http.post("/querySbomPackages", data);
  }

  querySbomPackageById(packageId: string): Promise<any> {
    return http.get(`/querySbomPackage/${packageId}`);
  }

  queryPackageBinaryManagement(
    packageId: string,
    binaryType: string
  ): Promise<any> {
    return http.get(`/queryPackageBinaryManagement/${packageId}/${binaryType}`);
  }

  querySbomPackagesByBinary(data: any): Promise<any> {
    return http.post(`/querySbomPackagesByBinary`, data);
  }

  exportSbom(data: any): Promise<any> {
    const config = {
      baseURL: SERVER_API_HOST + `/sbom-api`,
      headers: {
        "Content-type": "*/*",
        Accept: "application/octet-stream",
      },
      responseType: "blob" as ResponseType,
    } as AxiosRequestConfig;

    return http.post(`/exportSbom`, data, config);
  }

  queryProductStatistics(productName: string): Promise<any> {
    return http.get(`/queryProductStatistics/${productName}`);
  }

  queryProductVulTrend(
    productName: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<any> {
    return http.get(
      `/queryProductVulTrend/${productName}?startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`
    );
  }
  queryPackageVulsById(packageId: string): Promise<any> {
    return http.get(`/queryPackageStatistics/${packageId}`);
  }
  queryVulnerability(productName: string, str: string): Promise<any> {
    return http.get(`/queryVulnerability/${productName}?${str}`);
  }
  queryPackageVulnerability(packageId: string, str: string): Promise<any> {
    return http.get(`/queryPackageVulnerability/${packageId}?${str}`);
  }
  queryPackageLicenseAndCopyright(packageId: string): Promise<any> {
    return http.get(`/queryPackageLicenseAndCopyright/${packageId}`);
  }
  queryLicenseUniversalApi(params: any): Promise<any> {
    return http({
      url: `/queryLicenseUniversalApi`,
      method: "get",
      params,
    });
  }
  queryVulImpact(productName: string, vulId: string): Promise<any> {
    return http.get(`/queryVulImpact/${productName}?vulId=${vulId}`);
  }
  queryUpstreamAndPatchInfo(packageId: string): Promise<any> {
    return http.get(`/queryUpstreamAndPatchInfo/${packageId}`);
  }

  queryProductVulImpact(productName: string, params: any): Promise<any> {
    return http({
      url: `/queryProductVulImpact/${productName}`,
      method: "get",
      params,
    });
  }

  handleLogin(): Promise<any> {
    return http({
      url: `/login`,
      method: "get",
    });
  }

  handleLogout(): Promise<any> {
    return http({
      url: `/logout`,
      method: "get",
    });
  }

  refreshToken(): Promise<any> {
    return http({
      url: `/refreshToken`,
      method: "get",
    });
  }

  getUserInfo(): Promise<any> {
    return http({
      url: `/getInfo`,
      method: "get",
    });
  }
}

export default new SbomDataService();
