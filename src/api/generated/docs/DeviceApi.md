# DeviceApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDevice**](#getdevice) | **GET** /devices/{device_id} | Get specified device details|
|[**listDevices**](#listdevices) | **GET** /devices | List available devices|

# **getDevice**
> DevicesDeviceInfo getDevice()

get device

### Example

```typescript
import {
    DeviceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceApi(configuration);

let deviceId: string; //Device identifier (default to undefined)

const { status, data } = await apiInstance.getDevice(
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deviceId** | [**string**] | Device identifier | defaults to undefined|


### Return type

**DevicesDeviceInfo**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | job response |  -  |
|**404** | Device with device_id not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listDevices**
> Array<DevicesDeviceInfo> listDevices()

List available devices

### Example

```typescript
import {
    DeviceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceApi(configuration);

const { status, data } = await apiInstance.listDevices();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<DevicesDeviceInfo>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns a list of available devices |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

