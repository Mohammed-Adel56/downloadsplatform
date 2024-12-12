import { AiFillFacebook, AiFillTikTok } from "react-icons/ai";
import { FaInstagram, FaPinterestP, FaYoutube } from "react-icons/fa";
import { FaSquareTwitter } from "react-icons/fa6";
import { useContext, useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { SignupContext } from "../context/SignupContext";
import QRCode from "react-qr-code";
import { IoQrCodeSharp } from "react-icons/io5";

import { FaLink } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";

function HeroSection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("video"); // 'video' or 'audio'
  const [downloadProgress, setDownloadProgress] = useState({});
  const { isAuthenticated, userData } = useContext(SignupContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrlTitle, setNewUrlTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [savedUrls, setSavedUrls] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);

  // Add handler for opening QR modal
  const handleUrlClick = (url) => {
    setSelectedUrl(url);
    setQrModalOpen(true);
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };
  const handleAddUrl = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://downloadsplatform.com/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: newUrlTitle,
          url: newUrl,
          userId: userData.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save URL");
      }
      fetchUserUrls();
      // Here you can add API call to save the URL
      // console.log("Adding new URL:", { title: newUrlTitle, url: newUrl });
      setIsModalOpen(false);
      setNewUrlTitle("");
      setNewUrl("");
    } catch (error) {
      // console.error("Error adding URL:", error);
      toast.error("فشل في اضافة رابط");
    }
  };
  const fetchUserUrls = async () => {
    try {
      // console.log("*******************************");
      // console.log(userData);
      const response = await fetch(
        `https://downloadsplatform.com/api/urls/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const data = await response.json();
      setSavedUrls(data.urls);
    } catch (error) {
      // console.error("Error fetching URLs:", error);
      toast.error("فشل في تحميل روابط");
    }
  };
  useEffect(() => {
    if (isAuthenticated && userData) {
      fetchUserUrls();
    }
  }, [isAuthenticated, userData]);

  const downloadQRCode = (url, title) => {
    const safeId = btoa(url).replace(/[^a-zA-Z0-9]/g, "");
    const element = document.querySelector(`#qr-${safeId}`);
    // console.log(element);
    if (!element) return;

    htmlToImage
      .toPng(element)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${title}-qr.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        // console.error("Error generating QR code image:", error);
        toast.error("qr code فشل في تكوين صور من ");
      });
  };

  const handleGetInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await fetch("https://downloadsplatform.com/api/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء جلب المعلومات");
      }
      // console.log(data);
      console.log(data);
      setVideoInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId) => {
    try {
      setDownloadProgress((prev) => ({ ...prev, [formatId]: 0 }));
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `https://downloadsplatform.com/api/download?url=${encodeURIComponent(
          url
        )}&format_id=${formatId}`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const reader = response.body.getReader();
      const contentLength = response.headers.get("Content-Length");
      const total = parseInt(contentLength, 10);

      let receivedLength = 0;
      const chunks = [];

      while (true) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          chunks.push(value);
          receivedLength += value.length;

          const progress = (receivedLength / total) * 100;
          setDownloadProgress((prev) => ({ ...prev, [formatId]: progress }));
        } catch (error) {
          if (error.name === "AbortError") {
            throw new Error("Download timed out");
          }
          throw error;
        }
      }

      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${videoInfo.title}.${getFormatExtension(formatId)}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadProgress((prev) => ({ ...prev, [formatId]: 100 }));
      setLoading(false);
    }
  };

  const getFormatExtension = (formatId) => {
    const format = [
      ...(videoInfo.video_formats || []),
      ...(videoInfo.audio_formats || []),
    ].find((f) => f.format_id === formatId);
    return format?.ext || "mp4";
  };
  const handleThumbnailDownload = async () => {
    try {
      if (!videoInfo?.thumbnail) return;

      setLoading(true);
      const response = await fetch(
        `https://downloadsplatform.com/api/download-thumbnail?url=${encodeURIComponent(
          videoInfo.thumbnail
        )}`
      );

      if (!response.ok) throw new Error("Failed to download thumbnail");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${videoInfo.title}-thumbnail.jpg`; // You can adjust the extension based on the actual image type
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaDownload = async (mediaUrl, type) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://downloadsplatform.com/api/proxy-media?url=${encodeURIComponent(
          mediaUrl
        )}`
      );

      if (!response.ok) throw new Error("Failed to download media");

      // Get content-type from response headers
      const contentType = response.headers.get("content-type");

      // Determine file extension based on content-type
      let extension = "file";
      if (contentType) {
        if (contentType.includes("video")) extension = "mp4";
        else if (contentType.includes("image")) extension = "jpg";
        else if (contentType.includes("pdf")) extension = "pdf";
        // Add more content-type checks as needed
      }
      // console.log(extension);

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;

      // Try to get filename from Content-Disposition header, fallback to URL parsing
      const disposition = response.headers.get("content-disposition");
      let filename;
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/['"]/g, "");
      } else {
        filename =
          mediaUrl.split("/").pop().split("?")[0] || `download.${extension}`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaContent = () => {
    if (!videoInfo?.media?.length) return null;

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5 p-4 mt-4">
        {videoInfo.media.map((item, index) => (
          <div key={index} className="relative w-full max-w-sm mx-auto">
            {" "}
            {/* Added max-width and center alignment */}
            <div className="aspect-video relative">
              {" "}
              {/* Added aspect ratio container */}
              <img
                src={`https://downloadsplatform.com/api/proxy-media?url=${encodeURIComponent(
                  item.thumbnail || item.url
                )}`}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover rounded" /* Added object-fit */
              />
              <button
                onClick={() => handleMediaDownload(item.url, item.type)}
                className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
                title={`تحميل ${item.type === "video" ? "الفيديو" : "الصورة"}`}
              >
                <FaDownload size={16} />
              </button>
              <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {item.type === "video" ? "فيديو" : "صورة"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderYouTubeFormats = () => {
    if (!videoInfo?.video_formats && !videoInfo?.audio_formats) return null;

    return (
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{videoInfo.title}</h2>
        {videoInfo.thumbnail && (
          <div className="relative w-64 mx-auto mb-4">
            <img
              src={`https://downloadsplatform.com/api/proxy-media?url=${encodeURIComponent(
                videoInfo.thumbnail
              )}`}
              alt="thumbnail"
              className="w-full rounded"
            />
            <button
              onClick={handleThumbnailDownload}
              className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
              title="تحميل الصورة المصغرة"
            >
              <FaDownload size={16} />
            </button>
          </div>
        )}
        {/* Format Selection Tabs */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 mx-2 rounded ${
              activeTab === "video" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            تنسيقات الفيديو
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`px-4 py-2 mx-2 rounded ${
              activeTab === "audio" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            تنسيقات الصوت
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2  grid-cols-1">
          {activeTab === "video"
            ? videoInfo.video_formats.map((format) => (
                <div
                  key={format.format_id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload(format.format_id)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading
                        ? `${Math.round(downloadProgress[format.format_id])}%`
                        : "تحميل"}
                    </button>
                    {loading && (
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${downloadProgress[format.format_id]}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p>
                      {format.resolution} - {format.fps}fps
                    </p>
                    <p className="text-sm text-gray-500">
                      {format.ext} -{" "}
                      {format.acodec === "none" ? "بدون صوت" : "مع صوت"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format.filesize
                        ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB`
                        : "حجم غير معروف"}
                    </p>
                  </div>
                </div>
              ))
            : videoInfo.audio_formats.map((format) => (
                <div
                  key={format.format_id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload(format.format_id)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading
                        ? `${Math.round(downloadProgress[format.format_id])}%`
                        : "تحميل"}
                    </button>
                    {loading && (
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${downloadProgress[format.format_id]}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p>
                      {format.abr}kbps - {format.ext}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format.format_note}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format.filesize
                        ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB`
                        : "حجم غير معروف"}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    );
  };

  return (
    <section className="text-center py-20 bg-gray-50">
      <p className="text-gray-700 mb-6 font-medium">
        تنزيل الوسائط المتعددة بكل سهولة
      </p>
      <h1 className="text-4xl font-bold mb-4">
        ابدأ تحميل الوسائط المتعددة في ثوان
      </h1>
      <p className="text-gray-700 mb-6 font-medium">
        قم بلصق الرابط واختر التنسيقات والجوده المناسبه لا حتياجاتك
      </p>

      <form onSubmit={handleGetInfo} className="mb-4">
        <div className="flex items-center w-full max-w-md bg-gray-100 rounded-full p-2 shadow-sm mx-auto">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white w-52 py-2 rounded-full font-semibold hover:bg-blue-600 focus:outline-none ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-allowed"
            }`}
          >
            {loading ? "جاري التحميل..." : " تحميل الان"}
          </button>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="أدخل الرابط الخاص بك هنا"
            className="w-full bg-gray-100 outline-none text-right px-4 text-gray-500 placeholder-gray-500"
          />
        </div>
      </form>

      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {videoInfo && (
        <>
          {videoInfo.video_formats || videoInfo.audio_formats ? (
            renderYouTubeFormats()
          ) : videoInfo.media?.length > 0 ? (
            renderMediaContent()
          ) : (
            <div className="text-center text-gray-500 mt-4">
              لم يتم العثور على وسائط في هذا الرابط
            </div>
          )}
        </>
      )}

      {/* Add icons with links */}
      <div className="grid md:grid-cols-6 w-[50%] mx-auto  grid-cols-2 gap-5 mt-8   ">
        {/* Add media icons */}
        <a
          className="flex flex-col justify-center items-center"
          alt="facebook"
          href="https://www.facebook.com/"
          target="_blank"
        >
          <AiFillFacebook color="#385997" size={35} />
          <p className=" font-bold">Facebook</p>
        </a>
        <a
          className="flex flex-col justify-center items-center"
          alt="Instgram"
          href="https://www.instagram.com/"
          target="_blank"
        >
          <FaInstagram color="#dd2a84" size={35} />
          <p className=" font-bold">Instgram</p>
        </a>
        <a
          className="flex flex-col justify-center items-center"
          alt="Twitter"
          href="https://x.com/"
          target="_blank"
        >
          <FaSquareTwitter color="#00aade" size={35} />
          <p className=" font-bold">Twitter</p>
        </a>
        <a
          className="flex flex-col justify-center items-center"
          alt="TikTok"
          href="https://www.tiktok.com/"
          target="_blank"
        >
          <AiFillTikTok color="#010101" size={35} />
          <p className=" font-bold">TikTok</p>
        </a>
        <a
          className="flex flex-col justify-center items-center"
          alt="Pinterest"
          href="https://www.pinterest.com/"
          target="_blank"
        >
          <FaPinterestP color="#da2a2a" size={35} />
          <p className=" font-bold">Pinterest</p>
        </a>
        <a
          className="flex flex-col justify-center items-center"
          alt="YouTube"
          href="https://www.youtube.com/"
          target="_blank"
        >
          <FaYoutube color="#ed1f24" size={35} />
          <p className=" font-bold">YouTube</p>
        </a>

        {/* Other media icons */}
        {isAuthenticated && (
          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={handleAddClick}
          >
            <div className="bg-[#e6ebfe] p-2 mb-2 rounded-lg">
              <IoIosAdd size={35} />
            </div>
            <p className="font-bold">أضافة</p>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h2 className="text-xl font-bold">إضافة رابط جديد</h2>
              </div>
              <form onSubmit={handleAddUrl} className="space-y-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="title"
                    className="text-right mb-1 text-gray-700"
                  >
                    العنوان
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newUrlTitle}
                    onChange={(e) => setNewUrlTitle(e.target.value)}
                    className="border rounded-lg p-2 text-right"
                    placeholder="أدخل عنوان الرابط"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="url"
                    className="text-right mb-1 text-gray-700"
                  >
                    الرابط
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="border rounded-lg p-2 text-right"
                    placeholder="أدخل الرابط"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    إضافة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAuthenticated && savedUrls.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-4">
              {savedUrls.map((savedUrl) => (
                <div
                  key={savedUrl}
                  className="flex flex-col justify-center items-center cursor-pointer"
                  onClick={() => handleUrlClick(savedUrl)}
                >
                  <div className="bg-[#e6ebfe] p-2 mb-2 rounded-lg">
                    <IoQrCodeSharp size={35} />
                  </div>
                  <p className="font-bold">{savedUrl.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {qrModalOpen && selectedUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{selectedUrl.title}</h3>
                <button
                  onClick={() => setQrModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center mb-4">
                <QRCode
                  id={`qr-${btoa(selectedUrl.url).replace(
                    /[^a-zA-Z0-9]/g,
                    ""
                  )}`}
                  value={selectedUrl.url}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex items-center justify-around gap-4">
                <button
                  onClick={() =>
                    downloadQRCode(selectedUrl.url, selectedUrl.title)
                  }
                >
                  <MdFileDownload size={20} />
                </button>
                <a href={selectedUrl.url} target="_blank">
                  <FaLink size={20} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
