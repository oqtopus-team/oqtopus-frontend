# JobsJobInfo

Presigned URLs for downloading relevant job information .zip files from OQTOPUS cloud.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**input** | **string** | Content of the file will match &#x60;jobs.S3SubmitJobInfo&#x60; schema. | [default to undefined]
**combined_program** | **string** | For multiprogramming jobs, this file contains the combined circuit. | [optional] [default to undefined]
**result** | **string** | Content of the file will match &#x60;jobs.S3JobResult&#x60; schema. | [optional] [default to undefined]
**transpile_result** | **string** | Content of the file will match &#x60;jobs.S3TranspileResult&#x60; schema. | [optional] [default to undefined]
**sse_log** | **string** | File available only for sse jobs. | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { JobsJobInfo } from './api';

const instance: JobsJobInfo = {
    input,
    combined_program,
    result,
    transpile_result,
    sse_log,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
