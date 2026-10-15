# JobsS3SubmitJobInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**program** | **Array&lt;string&gt;** | A list of OPENQASM3 program. Required for sampling, estimation and multiprogramming jobs. For non-multiprogramming jobs, this field is assumed to contain exactly one program. Otherwise, those programs are combined according to the multiprogramming machinery. | [optional] [default to undefined]
**operator** | [**Array&lt;JobsS3OperatorItem&gt;**](JobsS3OperatorItem.md) | Estimation operator. Required for estimation jobs. | [optional] [default to undefined]
**sse_program** | **string** | SSE user program. Required for SSE jobs. | [optional] [default to undefined]

## Example

```typescript
import { JobsS3SubmitJobInfo } from './api';

const instance: JobsS3SubmitJobInfo = {
    program,
    operator,
    sse_program,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
