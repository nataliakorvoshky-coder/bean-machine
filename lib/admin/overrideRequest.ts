export async function overrideRequest({

  requestTable,
  requestId,

  newStatus,

  reason,

  adminId,
  adminName,

}: any) {

  const res =
    await fetch(

      "/api/admin/override-request",

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          requestTable,
          requestId,

          newStatus,

          reason,

          adminId,
          adminName,
        }),
      }
    );

  return res.json();
}