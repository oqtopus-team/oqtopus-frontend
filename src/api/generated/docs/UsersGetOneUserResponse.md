# UsersGetOneUserResponse

detail of user response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**organization** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**login_events** | [**Array&lt;UsersLoginEvent&gt;**](UsersLoginEvent.md) |  | [optional] [default to undefined]

## Example

```typescript
import { UsersGetOneUserResponse } from './api';

const instance: UsersGetOneUserResponse = {
    id,
    email,
    name,
    organization,
    created_at,
    login_events,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
