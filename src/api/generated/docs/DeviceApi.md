# DeviceApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDevice**](#getdevice) | **GET** /devices/{device_id} | Get specified device details|
|[**getDeviceInfoHistoryAt**](#getdeviceinfohistoryat) | **GET** /devices/{device_id}/device_info_history/at | Get device information history at timestamp|
|[**listDeviceInfoHistory**](#listdeviceinfohistory) | **GET** /devices/{device_id}/device_info_history | List device information history|
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
|**403** | Cannot access device with device_id |  -  |
|**404** | Device with device_id not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDeviceInfoHistoryAt**
> DevicesDeviceInfoHistoryDetail getDeviceInfoHistoryAt()

Returns the latest device information history whose calibrated_at is earlier than or equal to the specified timestamp.

### Example

```typescript
import {
    DeviceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceApi(configuration);

let deviceId: string; //Device identifier (default to undefined)
let timestamp: string; //Runtime timestamp used to resolve the effective device information. (default to undefined)

const { status, data } = await apiInstance.getDeviceInfoHistoryAt(
    deviceId,
    timestamp
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deviceId** | [**string**] | Device identifier | defaults to undefined|
| **timestamp** | [**string**] | Runtime timestamp used to resolve the effective device information. | defaults to undefined|


### Return type

**DevicesDeviceInfoHistoryDetail**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns resolved device information history. |  -  |
|**403** | Cannot access device with device_id |  -  |
|**404** | Device or history not found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listDeviceInfoHistory**
> DevicesDeviceInfoHistoryListResponse listDeviceInfoHistory()

List device information history metadata for the specified device.

### Example

```typescript
import {
    DeviceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceApi(configuration);

let deviceId: string; //Device identifier (default to undefined)
let from: string; //Inclusive lower bound of calibrated_at. (optional) (default to undefined)
let to: string; //Inclusive upper bound of calibrated_at. (optional) (default to undefined)
let limit: number; // (optional) (default to 100)
let offset: number; // (optional) (default to 0)

const { status, data } = await apiInstance.listDeviceInfoHistory(
    deviceId,
    from,
    to,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deviceId** | [**string**] | Device identifier | defaults to undefined|
| **from** | [**string**] | Inclusive lower bound of calibrated_at. | (optional) defaults to undefined|
| **to** | [**string**] | Inclusive upper bound of calibrated_at. | (optional) defaults to undefined|
| **limit** | [**number**] |  | (optional) defaults to 100|
| **offset** | [**number**] |  | (optional) defaults to 0|


### Return type

**DevicesDeviceInfoHistoryListResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns device information history metadata. |  -  |
|**403** | Cannot access device with device_id |  -  |
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

