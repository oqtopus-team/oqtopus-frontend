# JobsS3SubmitJobInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**program** | **Array&lt;string&gt;** | A list of OPENQASM3 program. For non-multiprogramming jobs, this field is assumed to contain exactly one program. Otherwise, those programs are combined according to the multiprogramming machinery. | [default to undefined]
**operator** | [**Array&lt;JobsS3OperatorItem&gt;**](JobsS3OperatorItem.md) |  | [optional] [default to undefined]

## Example

```typescript
import { JobsS3SubmitJobInfo } from './api';

const instance: JobsS3SubmitJobInfo = {
    program,
    operator,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
