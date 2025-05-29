# JobsSubmitJobRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**device_id** | **string** |  | [default to undefined]
**job_type** | [**JobsJobType**](JobsJobType.md) |  | [default to undefined]
**job_info** | [**JobsSubmitJobInfo**](JobsSubmitJobInfo.md) |  | [default to undefined]
**transpiler_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**simulator_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**mitigation_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**shots** | **number** |  | [default to undefined]

## Example

```typescript
import { JobsSubmitJobRequest } from './api';

const instance: JobsSubmitJobRequest = {
    name,
    description,
    device_id,
    job_type,
    job_info,
    transpiler_info,
    simulator_info,
    mitigation_info,
    shots,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
