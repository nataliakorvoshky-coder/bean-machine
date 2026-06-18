import { NextResponse }
  from "next/server";

import { supabase }
  from "@/lib/supabase";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    if (

      !body.complaint_id ||

      !body.employee_id

    ) {

      return NextResponse.json(

        {
          error:
            "Missing required fields"
        },

        {
          status: 400
        }
      );

    }

    /*
      GET EMPLOYEE
    */

    const {
      data: employee
    } = await supabase

      .from("employees")

      .select(`
        id,
        name
      `)

      .eq(
        "id",
        body.employee_id
      )

      .single();

    if (!employee) {

      return NextResponse.json(

        {
          error:
            "Employee not found"
        },

        {
          status: 404
        }
      );

    }

/*
  GET ROLE
*/

const {
  data: profiles,
  error: profileError
} = await supabase

  .from("profiles")

  .select(`
    id,
    employee_id,
    role_id
  `);

console.log(
  "ALL PROFILES:",
  profiles
);

console.log(
  "PROFILE ERROR:",
  profileError
);

const profile =
  profiles?.find(
    p =>
      p.employee_id ===
      employee.id
  );

console.log(
  "MATCHED PROFILE:",
  profile
);

/*
  ROLE IDS
*/

const ADMIN_ROLE_ID =
  "b6af0236-a889-43b3-b3dc-c87f57b8dcea";

const MANAGER_ROLE_ID =
  "c986c206-fac5-471b-9b61-bba35a8d950b";

const SUPERVISOR_ROLE_ID =
  "3fd64478-0441-4966-8ec8-89e5fbd50358";

const isAdmin =
  profile?.role_id ===
  ADMIN_ROLE_ID;

const isManager =
  profile?.role_id ===
  MANAGER_ROLE_ID;

const isSupervisor =
  profile?.role_id ===
  SUPERVISOR_ROLE_ID;

console.log({
  role_id:
    profile?.role_id,

  isAdmin,
  isManager,
  isSupervisor
});

    /*
      ADD MEMBER
    */

      console.log(
  "EMPLOYEE:",
  employee
);

console.log(
  "PROFILE:",
  profile
);

console.log({

  role_id:
    profile?.role_id,

  isAdmin,
  isManager,
  isSupervisor,

});

    const {
      data,
      error
    } = await supabase

      .from(
        "owner_chat_members"
      )

      .upsert(

        {

          complaint_id:
            body.complaint_id,

          employee_id:
            employee.id,

          employee_name:
            employee.name,

is_admin:
  isAdmin,

is_manager:
  isManager,

is_supervisor:
  isSupervisor,

        },

        {
          onConflict:
            "complaint_id,employee_id"
        }

      )

      .select()

      .single();

    if (error) {

      return NextResponse.json(

        {
          error:
            error.message
        },

        {
          status: 500
        }
      );

    }

    return NextResponse.json({

      success: true,

      member:
        data,

    });

  } catch (err: any) {

    return NextResponse.json(

      {
        error:
          err.message
      },

      {
        status: 500
      }
    );

  }

}