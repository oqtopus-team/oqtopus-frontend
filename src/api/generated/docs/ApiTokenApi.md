# ApiTokenApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createApiToken**](#createapitoken) | **POST** /api-token | create api token|
|[**deleteApiToken**](#deleteapitoken) | **DELETE** /api-token | delete api token|
|[**getApiToken**](#getapitoken) | **GET** /api-token | get api token|

# **createApiToken**
> Array<ApiTokenApiToken> createApiToken()

Create api token

### Example

```typescript
import {
    ApiTokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiTokenApi(configuration);

const { status, data } = await apiInstance.createApiToken();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ApiTokenApiToken>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create api token |  -  |
|**403** | Frobidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteApiToken**
> deleteApiToken()

Delete api token

### Example

```typescript
import {
    ApiTokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiTokenApi(configuration);

const { status, data } = await apiInstance.deleteApiToken();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete api token |  -  |
|**403** | Frobidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getApiToken**
> Array<ApiTokenApiToken> getApiToken()

Get api token

### Example

```typescript
import {
    ApiTokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiTokenApi(configuration);

const { status, data } = await apiInstance.getApiToken();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ApiTokenApiToken>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Return api token |  -  |
|**403** | Frobidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

