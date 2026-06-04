import {
  supabase
} from "@/lib/supabase";

export async function updateTicketView(

  requestTable: string,

  requestId: string

) {

  /*
    GET USER
  */

  const {
    data: auth
  } = await supabase
    .auth
    .getUser();

  const user =
    auth?.user;

  if (!user)
    return;

  /*
    UPSERT VIEW
  */

  await supabase

    .from("ticket_views")

    .upsert({

      user_id:
        user.id,

      request_table:
        requestTable,

      request_id:
        requestId,

      last_viewed_at:
        new Date()
          .toISOString(),

    });
}