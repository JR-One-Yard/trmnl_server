import YearProgress from "@/app/recipes/screens/year-progress/year-progress"
import getData from "@/app/recipes/screens/year-progress/getData"

export const dynamic = "force-dynamic"

export default async function YearProgressPage() {
  const data = await getData()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Year Progress Preview</h1>
        <p className="text-gray-600 mb-8">
          Day {data.dayIndex} of {data.totalDays} ({(data.percentage * 100).toFixed(1)}% complete)
        </p>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <YearProgress {...data} />
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Timezone: Australia/Sydney</p>
          <p>Current Date: {data.currentDate}</p>
          <p>Leap Year: {data.isLeapYear ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  )
}
