# JobsJobInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**program** | **Array&lt;string&gt;** | A list of OPENQASM3 program. For non-multiprogramming jobs, this field is assumed to contain exactly one program. Otherwise, those programs are combined according to the multiprogramming machinery. | [default to undefined]
**combined_program** | **string** | For multiprogramming jobs, this field contains the combined circuit. | [optional] [default to undefined]
**operator** | [**Array&lt;JobsOperatorItem&gt;**](JobsOperatorItem.md) | *(Only for estimation jobs)* The operator (or observable) for which the expectation value is to be estimated.  | [optional] [default to undefined]
**result** | [**JobsJobResult**](JobsJobResult.md) |  | [optional] [default to undefined]
**transpile_result** | [**JobsTranspileResult**](JobsTranspileResult.md) |  | [optional] [default to undefined]
**message** | **string** | Describing the reason why there is no result | [optional] [default to undefined]

## Example

```typescript
import { JobsJobInfo } from './api';

const instance: JobsJobInfo = {
    program,
    combined_program,
    operator,
    result,
    transpile_result,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
