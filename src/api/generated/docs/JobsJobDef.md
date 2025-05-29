# JobsJobDef


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**job_id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**job_type** | [**JobsJobType**](JobsJobType.md) |  | [default to undefined]
**status** | [**JobsJobStatus**](JobsJobStatus.md) |  | [default to undefined]
**device_id** | **string** |  | [default to undefined]
**shots** | **number** |  | [default to undefined]
**job_info** | [**JobsJobInfo**](JobsJobInfo.md) |  | [default to undefined]
**transpiler_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**simulator_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**mitigation_info** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**execution_time** | **number** |  | [optional] [default to undefined]
**submitted_at** | **string** |  | [optional] [default to undefined]
**ready_at** | **string** |  | [optional] [default to undefined]
**running_at** | **string** |  | [optional] [default to undefined]
**ended_at** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { JobsJobDef } from './api';

const instance: JobsJobDef = {
    job_id,
    name,
    description,
    job_type,
    status,
    device_id,
    shots,
    job_info,
    transpiler_info,
    simulator_info,
    mitigation_info,
    execution_time,
    submitted_at,
    ready_at,
    running_at,
    ended_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
