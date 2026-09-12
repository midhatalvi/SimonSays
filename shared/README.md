# /shared — LOCKED

These are the interfaces both halves of the team build against. Changing one
breaks the other person's code.

**Rule:** change only after explicit agreement, then update `CLAUDE.md` in the
same commit.

- `poses.js` — the 5 pose names, the `checkPose` interface, and the `Round` shape.

Import from here on both sides:

```js
import { POSES, POSE_NAMES } from "../shared/poses.js";
```
