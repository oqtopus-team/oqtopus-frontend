# JobsS3EstimationResult

*(Only for estimation jobs)* The estimated expectation value and the standard deviation of the operators specified in `job_info.operator` field which is intended to be provided for estimation jobs. 

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exp_value** | **number** | The estimated expectation value | [optional] [default to undefined]
**stds** | **number** | The standard deviation value | [optional] [default to undefined]

## Example

```typescript
import { JobsS3EstimationResult } from './api';

const instance: JobsS3EstimationResult = {
    exp_value,
    stds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
