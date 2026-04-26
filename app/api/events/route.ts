import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// GET
export async function GET(){

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_time",{ ascending:true })

  const { data: signups } = await supabase
    .from("event_signups")
    .select("*")

  const { data: rules } = await supabase
    .from("event_recurrence_rules")
    .select("*")

  return NextResponse.json({ events, signups, rules })
}


// POST
export async function POST(req: Request){

  const body = await req.json()

  if(body.type === "create_event"){

    const {
      title,
      description,
       flyer_url,
      start_time,
      end_time,
      is_recurring,
      recurrence
    } = body

    const { data: event, error } = await supabase
      .from("events")
.insert({
  title,
  description,
   flyer_url,
  start_time,
  end_time,
  is_recurring,
  allow_signup: body.allow_signup || false
})
      .select()
      .single()

    if(error){
      console.error("EVENT ERROR:", error)
      return NextResponse.json({ error })
    }

    if(is_recurring && recurrence){

      const { error: ruleError } = await supabase
        .from("event_recurrence_rules")
        .insert({
          event_id: event.id,
          frequency: recurrence.frequency,
          interval: recurrence.interval || 1,
          days_of_week: recurrence.days_of_week || null,
          week_of_month: recurrence.week_of_month || null,
          day_of_week: recurrence.day_of_week || null,
          end_type: recurrence.end_type || "never",
          recurrence_end: recurrence.recurrence_end || null,
          occurrence_count: recurrence.occurrence_count || null
        })

      if(ruleError){
        console.error("RULE ERROR:", ruleError)
      }
    }

    return NextResponse.json({ success:true })
  }

  // UPDATE EVENT
if(body.type === "update_event"){

  const {
    event_id,
    title,
    description,
     flyer_url,
    start_time,
    end_time,
    is_recurring,
    allow_signup
  } = body

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
       flyer_url,
      start_time,
      end_time,
      is_recurring,
      allow_signup
    })
    .eq("id", event_id)

  if(error){
    console.error("UPDATE ERROR:", error)
    return NextResponse.json({ error })
  }

  return NextResponse.json({ success:true })
}

// DELETE EVENT
if(body.type === "delete_event"){

  const { event_id } = body

  // delete signups first (avoid foreign key issues)
  await supabase
    .from("event_signups")
    .delete()
    .eq("event_id", event_id)

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", event_id)

  if(error){
    console.error("DELETE ERROR:", error)
    return NextResponse.json({ error })
  }

  return NextResponse.json({ success:true })
}

if(body.type === "signup"){

  const { event_id, employee_id, employee_name, occurrence_date } = body

  const { error } = await supabase
    .from("event_signups")
    .insert({
      event_id,
      employee_id,
      employee_name,
      occurrence_date
    })

  if(error){
    console.error("SIGNUP ERROR:", error)
  }

  return NextResponse.json({ success:true })
}}