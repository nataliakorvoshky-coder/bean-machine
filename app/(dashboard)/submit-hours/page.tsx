export default function SubmitHoursPage(){

return(

<div className="w-[1100px]">

<h1 className="text-3xl font-bold text-emerald-700 mb-10">
Submit Hours
</h1>

<div className="bg-white p-8 rounded-xl shadow">

<p className="text-emerald-700 mb-6">
Submit your worked hours for payroll.
</p>

<form className="flex flex-col gap-4 max-w-[400px]">

<input
type="date"
className="border border-emerald-300 rounded px-3 py-2"
/>

<input
type="number"
placeholder="Hours Worked"
className="border border-emerald-300 rounded px-3 py-2"
/>

<textarea
placeholder="Notes"
className="border border-emerald-300 rounded px-3 py-2"
/>

<button
className="bg-emerald-600 text-white px-5 py-2 rounded w-fit"
>
Submit Hours
</button>

</form>

</div>

</div>

)

}