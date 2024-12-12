import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar } from "recharts";
import axios from "axios";
import {
  FiUsers,
  FiDownload,
  FiClock,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    total_downloads: 0,
    avg_session_duration: 0,
    completed_profiles: 0,
    app_rating: 0,
    user_growth: [],
    devices_stats: [],
    countries_stats: [],
    visits_by_os: [],
    downloads_by_website: [],
    downloads_stats: {
      total_downloads: 0,
      authenticated_downloads: 0,
      anonymous_downloads: 0,
      downloads_by_format: [],
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [
        analyticsResponse,
        downloadsResponse,
        websiteStatsResponse,
        completedProfilesResponse,
      ] = await Promise.all([
        axios.get("https://downloadsplatform.com/api/analytics", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }),
        axios.get("https://downloadsplatform.com/api/stats/downloads", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }),
        axios.get(
          "https://downloadsplatform.com/api/stats/downloads-by-website",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        ),
        axios.get("https://downloadsplatform.com/api/completed-profiles",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        ), // Fetch completed profiles
      ]);

      setAnalytics({
        ...analyticsResponse.data,
        downloads_stats: downloadsResponse.data,
        downloads_by_website: websiteStatsResponse.data,
        completed_profiles: completedProfilesResponse.data.count,
      });
      // console.log(analytics);
    } catch (error) {
      // console.error("Error fetching analytics:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // Format session duration from seconds to minutes
  const formatDuration = (seconds) => {
    // console.log(seconds);
    if (!seconds) return "0:00";

    const minutes = Math.floor(seconds / 60);

    return `${minutes}:${Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate percentage change with proper handling of zero values
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return "+0.00%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              تصدير البيانات
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <StatsCard
            title="عدد المستخدمين"
            value={analytics.total_users.toLocaleString()}
            change={calculateChange(
              analytics.total_users,
              analytics.previous_users
            )}
            icon={<FiUsers className="h-6 w-6" />}
            color="blue"
          />
          <StatsCard
            title="عدد التحميلات"
            value={analytics.downloads_stats.total_downloads}
            change={calculateChange(
              analytics.downloads_stats.total_downloads,
              analytics.downloads_stats.previous_downloads
            )}
            icon={<FiDownload className="h-6 w-6" />}
            color="green"
          />
          <StatsCard
            title="متوسط مدة البقاء"
            value={`${formatDuration(analytics.avg_session_duration)} دقيقة`}
            change={calculateChange(
              analytics.avg_session_duration,
              analytics.previous_avg_session
            )}
            icon={<FiClock className="h-6 w-6" />}
            color="purple"
          />
          <StatsCard
            title="مستكملين الحساب"
            value={analytics.completed_profiles}
            change={calculateChange(
              analytics.completed_profiles,
              analytics.previous_completed_profiles
            )}
            icon={<FiCheckCircle className="h-6 w-6" />}
            color="indigo"
          />
          <StatsCard
            title="تحميلات المستخدمين"
            value={analytics.downloads_stats.authenticated_downloads.toLocaleString()}
            change={calculateChange(
              analytics.downloads_stats.authenticated_downloads,
              analytics.downloads_stats.previous_auth_downloads
            )}
            icon={<FiStar className="h-6 w-6" />}
            color="yellow"
          />
        </div>

        {/* User Growth Chart */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                نمو المستخدمين
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.user_growth}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* المواقع الأكثر تحميلاً */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                المواقع الأكثر تحميلاً
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.downloads_by_website}>
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="YouTube" fill="#FF0000" barSize={20} />
                    <Bar dataKey="Facebook" fill="#4267B2" barSize={20} />
                    <Bar dataKey="Instagram" fill="#E1306C" barSize={20} />
                    <Bar dataKey="TikTok" fill="#000000" barSize={20} />
                    <Bar dataKey="Twitter" fill="#1DA1F2" barSize={20} />
                    <Bar dataKey="Other" fill="#94a3b8" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ... باقي المكونات ... */}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* احصائيات الأجهزة */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                احصائيات الأجهزة
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.visits_by_os}
                    margin={{ left: 20, right: 30, top: 10, bottom: 30 }}
                    barGap={0}
                    barCategoryGap="15%"
                  >
                    <XAxis
                      dataKey="os"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      height={50}
                      tickFormatter={(value) => {
                        const labels = {
                          Linux: "Linux",
                          Mac: "Mac",
                          iOS: "iOS",
                          Windows: "Windows",
                          Android: "Android",
                          Other: "Other",
                        };
                        return labels[value] || value;
                      }}
                    />
                    <YAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      domain={[0, "dataMax + 5"]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                      label={{
                        position: "top",
                        formatter: (value) => value.toLocaleString(),
                        fill: "#6B7280",
                        fontSize: 12,
                      }}
                    >
                      {analytics.visits_by_os?.map((entry, index) => {
                        const colors = {
                          Linux: "#818CF8", // Purple
                          Mac: "#34D399", // Green
                          iOS: "#000000", // Black
                          Windows: "#60A5FA", // Blue
                          Android: "#93C5FD", // Light Blue
                          Other: "#6EE7B7", // Light Green
                        };
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[entry.os] || "#CBD5E1"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Countries Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                احصائيات الدول
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.users_by_country}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="country"
                    >
                      {analytics.users_by_country?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {analytics.users_by_country?.map((country, index) => (
                    <div key={country.country} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {country.country} (
                        {(
                          (country.count / analytics.total_users) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  const isPositive = change.startsWith("+");

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-3 rounded-full`}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <span
            className={`ml-2 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"];

export default Dashboard;
