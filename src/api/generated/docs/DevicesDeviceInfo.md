# DevicesDeviceInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**device_id** | **string** |  | [default to undefined]
**device_type** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**available_at** | **string** | Parameter mandatory and valid for \&#39;unavailable\&#39; devices | [optional] [default to undefined]
**n_pending_jobs** | **number** |  | [default to undefined]
**n_qubits** | **number** |  | [optional] [default to undefined]
**basis_gates** | **Array&lt;string&gt;** |  | [default to undefined]
**supported_instructions** | **Array&lt;string&gt;** |  | [default to undefined]
**device_info** | **string** | json format calibration_data and n_nodes etc | [optional] [default to undefined]
**calibrated_at** | **string** | Parameter available only for &#x60;QPU&#x60; devices with available calibration data | [optional] [default to undefined]
**description** | **string** |  | [default to undefined]

## Example

```typescript
import { DevicesDeviceInfo } from './api';

const instance: DevicesDeviceInfo = {
    device_id,
    device_type,
    status,
    available_at,
    n_pending_jobs,
    n_qubits,
    basis_gates,
    supported_instructions,
    device_info,
    calibrated_at,
    description,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
