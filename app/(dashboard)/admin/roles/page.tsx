"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { usePermission } from "@/lib/usePermission"

export default function RolesPage(){

  usePermission("admin")

  const [roles,setRoles] = useState<any[]>([])
  const [permissions,setPermissions] = useState<any[]>([])

  const pages = ["admin","dashboard","employees","settings"]

  useEffect(()=>{

    async function load(){

      const { data:rolesData } = await supabase
        .from("roles")
        .select("*")
        .order("name")

      const { data:permData } = await supabase
        .from("permissions")
        .select("*")

      console.log("ROLES:",rolesData)
      console.log("PERMISSIONS:",permData)

      setRoles(rolesData || [])
      setPermissions(permData || [])

    }

    load()

  },[])

  async function toggle(roleId:string,page:string,current:boolean){

    await supabase
      .from("permissions")
      .update({can_view:!current})
      .eq("role_id",roleId)
      .eq("page",page)

    setPermissions(p=>p.map((perm:any)=>{
      if(perm.role_id===roleId && perm.page===page){
        return {...perm,can_view:!current}
      }
      return perm
    }))

  }

  return(

    <div className="w-[1000px]">

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Roles & Permissions
      </h1>

      {roles.length===0 && (
        <p className="text-gray-500">
          No roles found in database.
        </p>
      )}

      <div className="space-y-6">

        {roles.map(role=>{

          return(

            <div
              key={role.id}
              className="bg-white p-6 rounded-xl shadow"
            >

              <h2 className="font-semibold text-lg text-emerald-700 mb-4">
                {role.name}
              </h2>

              <div className="space-y-2">

                {pages.map(page=>{

                  const perm = permissions.find(
                    (p:any)=>p.role_id===role.id && p.page===page
                  )

                  const enabled = perm?.can_view ?? false

                  return(

                    <div
                      key={page}
                      className="flex justify-between items-center border border-emerald-300 p-3 rounded-lg"
                    >

                      <span className="capitalize">
                        {page}
                      </span>

                      <button
                        onClick={()=>toggle(role.id,page,enabled)}
                        className={`px-3 py-1 rounded text-white ${
                          enabled
                          ? "bg-emerald-600"
                          : "bg-gray-400"
                        }`}
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </button>

                    </div>

                  )

                })}

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}