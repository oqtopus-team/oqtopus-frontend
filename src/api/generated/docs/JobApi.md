# JobApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelJob**](#canceljob) | **POST** /jobs/{job_id}/cancel | Cancel job|
|[**deleteJob**](#deletejob) | **DELETE** /jobs/{job_id} | Delete job|
|[**getJob**](#getjob) | **GET** /jobs/{job_id} | Get selected job|
|[**getJobStatus**](#getjobstatus) | **GET** /jobs/{job_id}/status | Get selected job\&#39;s status|
|[**getSselog**](#getsselog) | **GET** /jobs/{job_id}/sselog | Get SSE log file|
|[**listJobs**](#listjobs) | **GET** /jobs | List all quantum jobs|
|[**submitJob**](#submitjob) | **POST** /jobs | Submit a quantum job|

# **cancelJob**
> SuccessSuccessResponse cancelJob()

Start a procedure to cancel quantum job.<br/><br/> Operation is valid only for job with status: submitted, ready or running.

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobId: string; //Job identifier (default to undefined)

const { status, data } = await apiInstance.cancelJob(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Job identifier | defaults to undefined|


### Return type

**SuccessSuccessResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Job cancelled |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteJob**
> SuccessSuccessResponse deleteJob()

Deletes quantum job and related result<br/><br/>Operation is valid only for job with status: succeeded, failed and cancelled. submitted, ready and running jobs must be cancelled before deletion.

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobId: string; //Job identifier (default to undefined)

const { status, data } = await apiInstance.deleteJob(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Job identifier | defaults to undefined|


### Return type

**SuccessSuccessResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Quantum job deleted |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getJob**
> JobsJobDef getJob()

Get selected job

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobId: string; //Job identifier (default to undefined)

const { status, data } = await apiInstance.getJob(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Job identifier | defaults to undefined|


### Return type

**JobsJobDef**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return quantum job |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getJobStatus**
> JobsGetJobStatusResponse getJobStatus()

Get selected job\'s status

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobId: string; //Job identifier (default to undefined)

const { status, data } = await apiInstance.getJobStatus(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Job identifier | defaults to undefined|


### Return type

**JobsGetJobStatusResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return quantum job status |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSselog**
> JobsGetSselogResponse getSselog()

Get SSE log file of selected job

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobId: string; //Job identifier (default to undefined)

const { status, data } = await apiInstance.getSselog(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Job identifier | defaults to undefined|


### Return type

**JobsGetSselogResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return SSE log file |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listJobs**
> Array<JobsGetJobsResponse> listJobs()

By default, all available job\'s properties are returned. Use \'fields\' parameter to specify exact list of properties to get for each job.  List of jobs can be filtered by job creation time or search text with \'start_time\', \'end_time\' and \'q\' parameters.  Jobs are fetched with the pagination mechanism. This can be configured with \'page\' and \'perPage\' parameters. Check response\'s \'Link\' header for pagination details.

### Example

```typescript
import {
    JobApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let fields: string; //Allows to specify an exact list of job properties to fetch for a single job. Each element of the list must be a valid name of job property.  If parameter is specified and requested job field is not defined for a job null is returned.  If parameter is omitted all available job properties are returned. Undefined job properties (null properties) are not included in the response. (optional) (default to undefined)
let startTime: string; //Allows to filter the list of jobs to fetch by creation time. If specified only jobs with creation time  (createdAt property) >= start_time are returned. (optional) (default to undefined)
let endTiime: string; //Allows to filter the list of jobs to fetch by to creation time. If specified only jobs with creation time (createdAt property) <= end_time are returned. (optional) (default to undefined)
let q: string; //Allows to filter the list of jobs to fetch by job\'s name and description. If specified only jobs which name or description contains specified search string are returned. (optional) (default to undefined)
let page: number; //Set jobs list page number to fetch. If requested page number exceeds number of all pages last page is returned. (optional) (default to 1)
let size: number; //Configure number of jobs per page (optional) (default to 10)
let order: 'DESC' | 'ASC'; //Specify jobs order according to creation time (createdAt property) (optional) (default to 'ASC')

const { status, data } = await apiInstance.listJobs(
    fields,
    startTime,
    endTiime,
    q,
    page,
    size,
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **fields** | [**string**] | Allows to specify an exact list of job properties to fetch for a single job. Each element of the list must be a valid name of job property.  If parameter is specified and requested job field is not defined for a job null is returned.  If parameter is omitted all available job properties are returned. Undefined job properties (null properties) are not included in the response. | (optional) defaults to undefined|
| **startTime** | [**string**] | Allows to filter the list of jobs to fetch by creation time. If specified only jobs with creation time  (createdAt property) &gt;&#x3D; start_time are returned. | (optional) defaults to undefined|
| **endTiime** | [**string**] | Allows to filter the list of jobs to fetch by to creation time. If specified only jobs with creation time (createdAt property) &lt;&#x3D; end_time are returned. | (optional) defaults to undefined|
| **q** | [**string**] | Allows to filter the list of jobs to fetch by job\&#39;s name and description. If specified only jobs which name or description contains specified search string are returned. | (optional) defaults to undefined|
| **page** | [**number**] | Set jobs list page number to fetch. If requested page number exceeds number of all pages last page is returned. | (optional) defaults to 1|
| **size** | [**number**] | Configure number of jobs per page | (optional) defaults to 10|
| **order** | [**&#39;DESC&#39; | &#39;ASC&#39;**]**Array<&#39;DESC&#39; &#124; &#39;ASC&#39;>** | Specify jobs order according to creation time (createdAt property) | (optional) defaults to 'ASC'|


### Return type

**Array<JobsGetJobsResponse>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return a list of submitted quantum jobs |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitJob**
> JobsSubmitJobResponse submitJob()

Submit a quantum job

### Example

```typescript
import {
    JobApi,
    Configuration,
    JobsSubmitJobRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new JobApi(configuration);

let jobsSubmitJobRequest: JobsSubmitJobRequest; //Quantum job to be submitted (optional)

const { status, data } = await apiInstance.submitJob(
    jobsSubmitJobRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobsSubmitJobRequest** | **JobsSubmitJobRequest**| Quantum job to be submitted | |


### Return type

**JobsSubmitJobResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Job submitted |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

