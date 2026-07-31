# DevicesDeviceInfoHistoryEntry

## Properties

| Name              | Type       | Description                                      | Notes                  |
| ----------------- | ---------- | ------------------------------------------------ | ---------------------- |
| **history_uid**   | **string** | UUID assigned when the device history is issued. | [default to undefined] |
| **device_id**     | **string** |                                                  | [default to undefined] |
| **calibrated_at** | **string** |                                                  | [default to undefined] |
| **n_qubits**      | **number** |                                                  | [default to undefined] |
| **n_couplings**   | **number** |                                                  | [default to undefined] |

## Example

```typescript
import { DevicesDeviceInfoHistoryEntry } from './api';

const instance: DevicesDeviceInfoHistoryEntry = {
  history_uid,
  device_id,
  calibrated_at,
  n_qubits,
  n_couplings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
