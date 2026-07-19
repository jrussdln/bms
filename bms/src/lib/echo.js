import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { env } from "../config/env";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: env.PUSHER_APP_KEY,
  cluster: env.PUSHER_APP_CLUSTER,
  forceTLS: true,
});

export default echo;