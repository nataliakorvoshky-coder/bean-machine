"use client"

import { useEffect, useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import { supabase } from "@/lib/supabase";
import StyledDropdown from "@/components/StyledDropdown"
import StyledDatePicker from "@/components/StyledDatePicker"
import StyledDateTimePicker from "@/components/StyledDateTimePicker"
import { useUser } from "@/lib/UserContext"

import "react-big-calendar/lib/css/react-big-calendar.css"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  original?: any
  occurrence_date?: Date
}

const localizer = momentLocalizer(moment)


const API = "/api/events"

export default function EventsPage(){

  const { user, loading } = useUser()

  const [events,setEvents] = useState<any[]>([])
  const [rules,setRules] = useState<any[]>([])
  const [signups,setSignups] = useState<any[]>([])
  const [employees,setEmployees] = useState<any[]>([])
  const [profiles,setProfiles] = useState<any[]>([])
  const [currentEmployee,setCurrentEmployee] = useState<any>(null)
  const [selected,setSelected] = useState<any>(null)
  const [showForm,setShowForm] = useState(false)
  

const [form,setForm] = useState({
  title: "",
  description: "", 
  flyer_url: "",
  allow_signup: false,
  start_time: "",
  end_time: "",
  is_single_day: true,

  is_recurring: false,
  frequency: "weekly",
  interval: 1,

  days_of_week: [] as number[],

  week_of_month: 1,
  day_of_week: 0,

  // ✅ NEW
  recurrence_end: "",
  occurrence_count: 30,
  end_type: "never" as "never" | "date" | "count"
})

  useEffect(()=>{
    load()
  },[])

async function load(){
  try{
const res = await fetch(API)

if (!res.ok) {
  console.error("API ERROR", await res.text())
  return
}

const data = await res.json()

    setEvents(data?.events || [])
    setRules(data?.rules || [])
    setSignups(data?.signups || [])

    const { data: employeesData } = await supabase
  .from("employees")
  .select("*")

setEmployees(employeesData || [])

const { data: profilesData } = await supabase
  .from("profiles")
  .select("*")

setProfiles(profilesData || [])

  }catch(err){
    console.error("LOAD ERROR:", err)
    setEvents([])
    setRules([])
    setSignups([])
  }
}

  function getRule(eventId:string){
    return rules.find(r => r.event_id === eventId)
  }

  function generateOccurrences(event:any){

    const rule = getRule(event.id)

if(!event.is_recurring || !rule){

const start = new Date(event.start_time)
const end = new Date(event.end_time)

// 🚨 FORCE SAME DAY
end.setFullYear(
  start.getFullYear(),
  start.getMonth(),
  start.getDate()
)

// prevent midnight bug
if(start.getHours() === 0 && end.getHours() === 0){
  start.setHours(9,0,0,0)
  end.setHours(10,0,0,0)
}

  return [{
    ...event,
    start,
    end,
    allDay: false
  }]
}

    const occurrences:any[] = []
    const start = event.start_time ? new Date(event.start_time) : new Date()

   const max =
  rule.end_type === "count"
    ? rule.occurrence_count
    : 100

for(let i=0;i<max;i++){

      let d = new Date(start)

if(rule.frequency === "daily") d.setDate(d.getDate() + i * (rule.interval || 1))
if(rule.frequency === "monthly") d.setMonth(d.getMonth() + i * (rule.interval || 1))
if(rule.frequency === "yearly"){

  const base = new Date(start)
  base.setFullYear(base.getFullYear() + i * (rule.interval || 1))

  const d = new Date(base)

  if(rule.end_type === "date"){
    const endDate = new Date(rule.recurrence_end)
    if(d > endDate) continue
  }

  const startTime = new Date(d)
  startTime.setHours(start.getHours(), start.getMinutes())

  const endTime = new Date(d)
  endTime.setHours(
    new Date(event.end_time).getHours(),
    new Date(event.end_time).getMinutes()
  )

  occurrences.push({
    ...event,
    start: startTime,
    end: endTime,
    allDay: false,
    original: event,
    occurrence_date: d
  })

  continue
}

if(rule.frequency === "weekly"){

  const base = new Date(start)
  base.setDate(base.getDate() + i * 7 * (rule.interval || 1))

  const days = rule.days_of_week?.length
    ? rule.days_of_week
    : [start.getDay()]

  days.forEach((day:number) => {

    const d = new Date(base)

    // ✅ FIXED DAY CALCULATION
    const diff = day - d.getDay()
    d.setDate(d.getDate() + diff)

    // ✅ END DATE CHECK HERE (CORRECT PLACE)
    if(rule.end_type === "date"){
      const endDate = new Date(rule.recurrence_end)
      if(d > endDate) return
    }

const originalStart = new Date(event.start_time)
const originalEnd = new Date(event.end_time)

const startTime = new Date(d)
startTime.setHours(
  originalStart.getHours(),
  originalStart.getMinutes(),
  0,
  0
)

const endTime = new Date(d)
endTime.setHours(
  originalEnd.getHours(),
  originalEnd.getMinutes(),
  0,
  0
)

    occurrences.push({
      ...event,
      start: startTime,
      end: endTime,
      allDay: false,
      original: event,
      occurrence_date: d
    })

  })

  continue
}

if(rule.frequency === "monthly"){

  const base = new Date(start)
  base.setMonth(base.getMonth() + i * (rule.interval || 1))

  let d = new Date(base)

  if(rule.week_of_month === -1){
    // 🔥 LAST weekday of month
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0)

    while(lastDay.getDay() !== rule.day_of_week){
      lastDay.setDate(lastDay.getDate() - 1)
    }

    d = lastDay

  } else {
    // 🔥 FIRST / SECOND / THIRD / FOURTH
    const firstDay = new Date(base.getFullYear(), base.getMonth(), 1)

    let offset = (rule.day_of_week - firstDay.getDay() + 7) % 7
    offset += (rule.week_of_month - 1) * 7

    d = new Date(firstDay)
    d.setDate(firstDay.getDate() + offset)
  }

  // ✅ end date check
  if(rule.end_type === "date"){
    const endDate = new Date(rule.recurrence_end)
    if(d > endDate) continue
  }

const originalStart = new Date(event.start_time)
const originalEnd = new Date(event.end_time)

const startTime = new Date(d)
startTime.setHours(
  originalStart.getHours(),
  originalStart.getMinutes(),
  0,
  0
)

const endTime = new Date(d)
endTime.setHours(
  originalEnd.getHours(),
  originalEnd.getMinutes(),
  0,
  0
)

  occurrences.push({
    ...event,
    start: startTime,
    end: endTime,
    allDay: false,
    original: event,
    occurrence_date: d
  })

  continue
}

const originalStart = new Date(event.start_time)
const originalEnd = new Date(event.end_time)

const startTime = new Date(d)
startTime.setHours(
  originalStart.getHours(),
  originalStart.getMinutes(),
  0,
  0
)

const endTime = new Date(d)
endTime.setHours(
  originalEnd.getHours(),
  originalEnd.getMinutes(),
  0,
  0
)

// 🚨 CRITICAL FIX — FORCE SAME DAY
endTime.setFullYear(
  startTime.getFullYear(),
  startTime.getMonth(),
  startTime.getDate()
)

occurrences.push({
  ...event, // ✅ brings description + allow_signup directly
  start: startTime,
  end: endTime,
  allDay: false,
  original: event,
  occurrence_date: d
})
    }

    return occurrences
  }

  const calendarEvents = (events || []).flatMap(e => generateOccurrences(e))

function getSignups(event:any){

  return signups.filter(s => {

    if(!s.occurrence_date) return false

    const signupDate = new Date(s.occurrence_date).toDateString()
    const eventDate = new Date(event.occurrence_date || event.start).toDateString()

    return s.event_id === event.id && signupDate === eventDate
  })
}

async function signup(event:any){

  const { data: auth } = await supabase.auth.getUser()
  const currentUser = auth?.user

  if(!currentUser){
    alert("Not logged in")
    return
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      employee_id,
      employees (
        name
      )
    `)
    .eq("id", currentUser.id)
    .single()

    if(!profile){
  alert("Profile not found")
  return
}

const employee = Array.isArray(profile?.employees)
  ? profile.employees[0]
  : profile?.employees

if(!employee?.name){
  alert("Employee not found")
  return
}

  await fetch(API,{
    method:"POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type:"signup",
      event_id: event.id,
      occurrence_date: event.occurrence_date || event.start,
      employee_id: profile.employee_id,
      employee_name: employee.name
    })
  })

  load()
}

  async function deleteEvent(){

    if(!selected) return

    await fetch(API,{
      method:"POST",
      body: JSON.stringify({
        type:"delete_event",
        event_id: selected.id
      })
    })

    setSelected(null)
    setShowForm(false)
    load()
  }

  async function submitEvent(){

    if(!form.title || !form.start_time){
      alert("Missing required fields")
      return
    }

const recurrence = form.is_recurring ? {
  frequency: form.frequency,
  interval: form.interval,
  days_of_week: form.days_of_week,
  week_of_month: form.week_of_month,
  day_of_week: form.day_of_week,

  // NEW
  end_type: form.end_type,
  recurrence_end: form.recurrence_end,
  occurrence_count: form.occurrence_count
} : null

    await fetch(API,{
      method:"POST",
      body: JSON.stringify({
        type: selected
  ? (selected.editMode === "single" ? "update_single" : "update_event")
  : "create_event",
        event_id: selected?.id || null,
        occurrence_date: selected?.occurrence_date || null,
        title: form.title,
        description: form.description,
        flyer_url: form.flyer_url,
        allow_signup: form.allow_signup,
start_time: form.start_time,
end_time: form.is_single_day ? form.start_time : form.end_time,
        is_recurring: form.is_recurring,
        recurrence
      })
    })

    setShowForm(false)
    setSelected(null)

setForm({
  title:"",
  description:"",
  flyer_url:"",
  allow_signup:false,
  start_time:"",
  end_time:"",
  is_single_day:true,

  is_recurring:false,
  frequency:"weekly",
  interval:1,

  days_of_week:[],
  week_of_month:1,
  day_of_week:0,

  // ✅ ADD THESE BACK
  recurrence_end:"",
  occurrence_count:30,
  end_type:"never"
})

    load()
  }

  async function compressImage(file: File) {
  return new Promise<File>((resolve) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    img.onload = () => {
      const maxWidth = 800
      const scale = maxWidth / img.width

      canvas.width = maxWidth
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

const isPNG = file.type === "image/png"

canvas.toBlob((blob) => {
  resolve(
    new File([blob!], file.name, {
      type: isPNG ? "image/png" : "image/webp"
    })
  )
},
isPNG ? "image/png" : "image/webp",
isPNG ? 1 : 0.85
)
    }

    img.src = URL.createObjectURL(file)
  })
}

  return(

    <div className="w-full px-6 py-10">

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-emerald-700">
          Event Calendar
        </h1>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100">

        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}

          selectable
          popup
          views={["month","week","day"]}
          dayLayoutAlgorithm="no-overlap"
          showMultiDayTimes={false}

          eventPropGetter={() => ({
            style: {
              backgroundColor: "#059669",
              borderRadius: "8px",
              border: "none",
              color: "white",
              padding: "2px 6px",
              fontSize: "12px"
            }
          })}

components={{
  event: ({ event }) => (
    <div
      style={{
        background: "#059669",
        borderRadius: "6px",

        width: "100%",
        height: "100%",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: "12px",
        color: "white",

        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}
    >
      {event.title}
    </div>
  )
}}

onSelectSlot={(slot: { start: Date; end: Date }) => {

  setSelected(null)

  // ✅ FULL RESET (this fixes your issue)
  setForm({
    title: "",
    description: "",
    flyer_url:"",
    allow_signup: false,

    start_time: moment(slot.start).format("YYYY-MM-DDTHH:mm"),
    end_time: moment(slot.end).format("YYYY-MM-DDTHH:mm"),

    is_single_day: true,

    is_recurring: false,
    frequency: "weekly",
    interval: 1,

    days_of_week: [],
    week_of_month: 1,
    day_of_week: 0,

    recurrence_end: "",
    occurrence_count: 30,
    end_type: "never"
  })

  setShowForm(true)
}}

onSelectEvent={(event: CalendarEvent)=>{
  setSelected({
    ...event,
    mode: "preview"
  })
}}
        />

      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="
bg-white p-6 rounded-2xl w-[520px]
shadow-xl border border-emerald-100
space-y-6
max-h-[90vh] overflow-y-auto no-scrollbar
">

            <h2 className="text-xl font-bold text-emerald-700">
              {selected ? "Edit Event" : "Create Event"}
            </h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={e=>setForm({...form,title:e.target.value})}
              className="
w-full border border-emerald-300 rounded-lg
px-3 py-2 text-sm bg-white
focus:outline-none focus:ring-2 focus:ring-emerald-500
"
            />

            {selected?.editMode === "single" && (
  <div className="text-xs text-amber-600">
    Editing only this occurrence
  </div>
)}

{selected?.editMode === "series" && selected && (
  <div className="text-xs text-gray-500">
    Editing entire series
  </div>
)}

            <textarea
              placeholder="Description"
              
              value={form.description}
              onChange={e=>setForm({...form,description:e.target.value})}
              className="
w-full border border-emerald-300 rounded-lg
px-3 py-2 text-sm bg-white
focus:outline-none focus:ring-2 focus:ring-emerald-500
"
            />

<div className="space-y-2 mt-4">

  <label className="text-xs text-emerald-600 font-medium block mb-1">
    Event Flyer
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={async (e:any) => {
      const file = e.target.files[0]
      if(!file) return

// 🧹 DELETE ALL OLD FLYERS FOR THIS EVENT
const eventId = selected?.id || "new"
const folder = `flyers/${eventId}`

const { data: files } = await supabase.storage
  .from("event-flyers")
  .list(folder)

if(files?.length){
  const paths = files.map(f => `${folder}/${f.name}`)

  const { error } = await supabase.storage
    .from("event-flyers")
    .remove(paths)

  if(error){
    console.error("FOLDER DELETE ERROR:", error)
  }
}

      const compressed = await compressImage(file)

      const fileExt = file.name.split(".").pop()
const fileName = `${eventId}/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from("event-flyers")
        .upload(`flyers/${fileName}`, compressed, {
          cacheControl: "3600",
          upsert: true,
          contentType: compressed.type
        })

      if(error){
        console.error("UPLOAD ERROR:", error)
        alert(error.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from("event-flyers")
        .getPublicUrl(`flyers/${fileName}`)

      setForm({
        ...form,
        flyer_url: urlData.publicUrl
      })
    }}


    className="block w-full text-sm"
  />

  

  {/* PREVIEW + DELETE */}
  {form.flyer_url && (
    <div className="space-y-2 mt-2">

      <img
        src={form.flyer_url}
        className="w-full rounded-lg shadow-sm"
      />

<button
  type="button"
  onClick={async () => {

    if(!form.flyer_url){
      setForm({ ...form, flyer_url: "" })
      return
    }

    try{
      const path = form.flyer_url.split("/flyers/")[1]

      if(path){
        const { error } = await supabase.storage
          .from("event-flyers")
          .remove([`flyers/${path}`])

        if(error){
          console.error("DELETE ERROR:", error)
          alert("Failed to delete flyer")
          return
        }
      }

      setForm({ ...form, flyer_url: "" })

    }catch(err){
      console.error(err)
    }
  }}
  className="text-xs text-red-500 hover:text-red-600 underline"
>
  Remove flyer
</button>

    </div>
  )}

</div>

{/* SCHEDULE */}
<div className="space-y-3">

  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
    Schedule
  </div>

  <div className="flex items-center gap-4 text-sm">
    <label className="flex items-center gap-2 text-emerald-700 font-medium">
      <input
        type="checkbox"
        checked={form.is_single_day}
        onChange={e=>setForm({...form,is_single_day:e.target.checked})}
      />
      Single Day
    </label>

    <label className="flex items-center gap-2 text-emerald-700 font-medium">
      <input
        type="checkbox"
        checked={form.is_recurring}
        onChange={e=>setForm({...form,is_recurring:e.target.checked})}
      />
      Recurring
    </label>
  </div>

  <label className="flex items-center gap-2 text-emerald-700 font-medium">
  <input
    type="checkbox"
    checked={form.allow_signup}
    onChange={e=>setForm({...form,allow_signup:e.target.checked})}
  />
  Allow Employee Signups
</label>

  <div className="grid grid-cols-2 gap-2">

<StyledDateTimePicker
  value={form.start_time}
  onChange={(val)=>setForm({...form,start_time:val})}
/>

{!form.is_single_day && (
  <StyledDateTimePicker
    value={form.end_time}
    onChange={(val)=>setForm({...form,end_time:val})}
  />
)}

  </div>

</div>

{/* RECURRENCE */}
{form.is_recurring && (

<div className="space-y-4 border-t pt-4">

<div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
  Recurrence
</div>

  {/* Frequency */}
  <div>
    <label className="text-xs text-emerald-600 font-medium">Repeat</label>
<StyledDropdown
  placeholder="Select frequency"
  value={form.frequency}
  onChange={(val)=>setForm({...form,frequency:val})}
  options={[
    { id:"daily", name:"Daily" },
    { id:"weekly", name:"Weekly" },
    { id:"monthly", name:"Monthly" },
    { id:"yearly", name:"Yearly" }
  ]}
  className="w-full"
/>
  </div>

  {/* Interval */}
  <div>
   <label className="text-xs text-emerald-600 font-medium">
  Every (interval)
</label>
    <input
      type="number"
      min={1}
      value={form.interval}
      onChange={e=>setForm({...form,interval:Number(e.target.value)})}
      className="
w-full border border-emerald-300 rounded-lg
px-3 py-2 text-sm bg-white
focus:outline-none focus:ring-2 focus:ring-emerald-500
"
    />
  </div>

  {/* WEEKLY */}
  {form.frequency === "weekly" && (
    <div>
      <label className="text-xs text-emerald-600 font-medium">Days of Week</label>
      <div className="flex gap-2 flex-wrap text-xs mt-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>(
          <button
            type="button"
            key={i}
            onClick={()=>{
              const exists = form.days_of_week.includes(i)
              setForm({
                ...form,
                days_of_week: exists
                  ? form.days_of_week.filter(x=>x!==i)
                  : [...form.days_of_week,i]
              })
            }}
            className={`px-2 py-1 rounded ${
              form.days_of_week.includes(i)
                ? "bg-emerald-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )}

{/* MONTHLY */}
{form.frequency === "monthly" && (
  <div className="space-y-3">

    <label className="text-xs text-emerald-600 font-medium">
      Occurs on
    </label>

    <div className="grid grid-cols-2 gap-2">

      <StyledDropdown
        placeholder="Week"
        value={String(form.week_of_month)}
        onChange={(val)=>setForm({...form,week_of_month:Number(val)})}
        options={[
          { id:"1", name:"First" },
          { id:"2", name:"Second" },
          { id:"3", name:"Third" },
          { id:"4", name:"Fourth" },
          { id:"-1", name:"Last" }
        ]}
        className="w-full"
      />

      <StyledDropdown
        placeholder="Day"
        value={String(form.day_of_week)}
        onChange={(val)=>setForm({...form,day_of_week:Number(val)})}
        options={[
          { id:"0", name:"Sunday" },
          { id:"1", name:"Monday" },
          { id:"2", name:"Tuesday" },
          { id:"3", name:"Wednesday" },
          { id:"4", name:"Thursday" },
          { id:"5", name:"Friday" },
          { id:"6", name:"Saturday" }
        ]}
        className="w-full"
      />

    </div>

    {/* 👇 THIS IS THE IMPORTANT PART */}
    <p className="text-xs text-gray-400">
      Example: First Saturday of every month
    </p>

  </div>
)}

  {/* END OPTIONS */}
  <div className="space-y-2">

    <label className="text-xs text-emerald-600 font-medium">Ends</label>

<StyledDropdown
  placeholder="Ends"
  value={form.end_type}
  onChange={(val)=>setForm({...form,end_type:val as any})}
  options={[
    { id:"never", name:"Never" },
    { id:"date", name:"On Date" },
    { id:"count", name:"After X Times" }
  ]}
  className="w-full"
/>

    {form.end_type === "date" && (
<StyledDatePicker
  value={form.recurrence_end}
  onChange={(val)=>setForm({...form,recurrence_end:val})}
/>

    )}

    {form.end_type === "count" && (
      <input
        type="number"
        min={1}
        value={form.occurrence_count}
        onChange={e=>setForm({...form,occurrence_count:Number(e.target.value)})}
        className="
w-full border border-emerald-300 rounded-lg
px-3 py-2 text-sm bg-white
focus:outline-none focus:ring-2 focus:ring-emerald-500
"
      />
    )}

  </div>

</div>

)}

            <div className="flex justify-between items-center">

              {selected && (
                <button onClick={deleteEvent} className="text-red-500 text-sm">
                  Delete
                </button>
              )}

<div className="flex gap-3 items-center">

  <button
    onClick={()=>setShowForm(false)}
    className="
px-4 py-2 rounded-lg text-sm
border border-emerald-300
text-emerald-600
hover:bg-emerald-50
transition
"
  >
    Cancel
  </button>

  <button
    onClick={submitEvent}
    className="
bg-emerald-600 text-white px-4 py-2 rounded-lg
hover:bg-emerald-700 transition
"
  >

                  {selected ? "Update" : "Create"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

{/* PREVIEW MODAL */}
{selected && selected.mode === "preview" && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-2xl w-[420px] shadow-xl space-y-4">

      <h2 className="text-xl font-bold text-emerald-700">
        {selected.title}
      </h2>

      {(selected.original?.flyer_url || selected.flyer_url) && (
  <img
    src={selected.original?.flyer_url || selected.flyer_url}
    className="w-full rounded-lg mb-3"
  />
)}

      <div className="text-sm text-emerald-700">
        {selected.description || selected.original?.description || "No description"}
      </div>

     <div className="text-sm text-emerald-500">
        {moment(selected.start).format("MMM D, YYYY • h:mm A")}
      </div>

      {/* ATTENDEES */}
      <div>
        <div className="text-xs font-semibold text-emerald-600 mb-1">
          Attendees
        </div>

        <div className="text-sm text-emerald-500">
          {getSignups(selected).length === 0
            ? "No one yet"
            : getSignups(selected).map((s:any)=>s.employee_name).join(", ")
          }
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between items-center pt-3">

        <div className="flex gap-2">

          {/* SIGNUP */}
          {(selected.allow_signup || selected.original?.allow_signup) && (
            <button
              onClick={()=>signup(selected)}
              className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              Sign Up
            </button>
          )}

          {/* EDIT */}
          <button
onClick={()=>{

  // KEEP selected so form knows it's editing
  setSelected({
    ...selected,
    editMode: "series"
  })

setForm({
  title: selected.title,
  description: selected.original?.description || "",
  flyer_url: selected.original?.flyer_url || selected.flyer_url || "", // ✅ ADD THIS

  start_time: moment(selected.start).format("YYYY-MM-DDTHH:mm"),
  end_time: moment(selected.end).format("YYYY-MM-DDTHH:mm"),

  allow_signup: selected.original?.allow_signup || false,

  is_single_day: true,
  is_recurring: selected.original?.is_recurring || false,

  frequency: selected.original?.frequency || "weekly",
  interval: selected.original?.interval || 1,

  days_of_week: selected.original?.days_of_week || [],
  week_of_month: selected.original?.week_of_month || 1,
  day_of_week: selected.original?.day_of_week || selected.start.getDay(),

  recurrence_end: selected.original?.recurrence_end || "",
  occurrence_count: selected.original?.occurrence_count || 30,
  end_type: selected.original?.end_type || "never"
})

  setSelected((prev:any)=>({
  ...prev,
  mode: undefined // 👈 THIS CLOSES PREVIEW ONLY
}))

  setShowForm(true)
}}

            className="border border-emerald-300 px-3 py-2 rounded-lg text-sm text-emerald-600"
          >
            Edit
          </button>

        </div>

        <button
          onClick={()=>setSelected(null)}
          className="text-sm text-gray-500"
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  )
}