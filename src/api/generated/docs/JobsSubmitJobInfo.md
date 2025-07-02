# JobsSubmitJobInfo

All fields in this schema also exist in the `JobInfo` schema and have the same meaning as their counterparts in the `JobInfo` schema.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**program** | **Array&lt;string&gt;** | A list of OPENQASM3 program. For non-multiprogramming jobs, this field is assumed to contain exactly one program. Otherwise, those programs are combined according to the multiprogramming machinery. | [default to undefined]
**operator** | [**Array&lt;JobsOperatorItem&gt;**](JobsOperatorItem.md) |  | [optional] [default to undefined]

## Example

```typescript
import { JobsSubmitJobInfo } from './api';

const instance: JobsSubmitJobInfo = {
    program,
    operator,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
