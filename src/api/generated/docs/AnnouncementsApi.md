# AnnouncementsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAnnouncement**](#getannouncement) | **GET** /announcements/{announcement_id} | Get selected announcement|
|[**getAnnouncementsList**](#getannouncementslist) | **GET** /announcements | Get announcements list from backend|

# **getAnnouncement**
> AnnouncementsGetAnnouncementResponse getAnnouncement()

Get selected announcement

### Example

```typescript
import {
    AnnouncementsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnnouncementsApi(configuration);

let announcementId: number; //announcement ID (default to undefined)

const { status, data } = await apiInstance.getAnnouncement(
    announcementId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **announcementId** | [**number**] | announcement ID | defaults to undefined|


### Return type

**AnnouncementsGetAnnouncementResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return selected announcement |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Not authorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAnnouncementsList**
> AnnouncementsGetAnnouncementsListResponse getAnnouncementsList()

Get announcements list from backend

### Example

```typescript
import {
    AnnouncementsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AnnouncementsApi(configuration);

let offset: string; //offset information (optional) (default to undefined)
let limit: string; //Limit information (optional) (default to undefined)
let order: 'DESC' | 'ASC'; //Specify order according to start time (optional) (default to 'ASC')
let currentTime: string; //Allows to filter the list of announcements to fetch by provided time. If specified only announcements with start_time <= current_time and end_time >= current_time are returned. (optional) (default to undefined)

const { status, data } = await apiInstance.getAnnouncementsList(
    offset,
    limit,
    order,
    currentTime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **offset** | [**string**] | offset information | (optional) defaults to undefined|
| **limit** | [**string**] | Limit information | (optional) defaults to undefined|
| **order** | [**&#39;DESC&#39; | &#39;ASC&#39;**]**Array<&#39;DESC&#39; &#124; &#39;ASC&#39;>** | Specify order according to start time | (optional) defaults to 'ASC'|
| **currentTime** | [**string**] | Allows to filter the list of announcements to fetch by provided time. If specified only announcements with start_time &lt;&#x3D; current_time and end_time &gt;&#x3D; current_time are returned. | (optional) defaults to undefined|


### Return type

**AnnouncementsGetAnnouncementsListResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return announcements |  -  |
|**401** | Unauthorized |  -  |
|**403** | Not authorized : user is not admin |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

