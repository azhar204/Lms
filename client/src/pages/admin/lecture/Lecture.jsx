import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Video, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useEndLiveLectureMutation } from "@/features/api/courseApi";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Lecture({
  lecture,
  courseId,
  index,
  isInstructor = true,
}) {
  const navigate = useNavigate();
  const [endLiveLecture, { isLoading: endingLive }] =
    useEndLiveLectureMutation();
  const [isExpanded, setIsExpanded] = useState(false);

  const goToUpdateLecture = () => {
    navigate(`${lecture._id}`);
  };

  const handleEndLiveLecture = async () => {
    try {
      await endLiveLecture(lecture._id).unwrap();
      toast.success("Live lecture ended successfully", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to end live lecture", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  const isStreamPreparing =
    lecture.isLive && (!lecture.streamUrl || !lecture.streamKey);

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {index + 1}. {lecture.lectureTitle}
          </span>
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            <Edit
              onClick={goToUpdateLecture}
              size={20}
              className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={isExpanded ? "block" : "hidden"}>
        {lecture.isLive ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <Video className="inline mr-2 h-4 w-4" />
              Live Lecture: Scheduled for{" "}
              {format(new Date(lecture.startTime), "PPp")}
            </p>
            {isInstructor && lecture.isLive && (
              <>
                {isStreamPreparing ? (
                  <div className="flex items-center text-blue-500 text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Stream is preparing...
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 break-words space-y-1">
                      <p className="break-words">
                        Stream URL: {lecture.streamUrl || "Not available"}
                      </p>
                      <p className="break-words">
                        Stream Key: {lecture.streamKey || "Not available"}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            disabled={!lecture.streamUrl || !lecture.streamKey}
                          >
                            Set Up OBS
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>OBS Setup Instructions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>
                              To start your live lecture, configure OBS with the
                              following settings:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                              <li>
                                Sources: Add a Video Capture Device for your
                                camera and an Audio Input Capture for your
                                microphone.
                              </li>
                              <li>
                                Settings > Stream:
                                <ul className="list-disc list-inside ml-4">
                                  <li>Service: Custom</li>
                                  <li>Server: `{lecture.streamUrl}`</li>
                                  <li>Stream Key: `{lecture.streamKey}`</li>
                                </ul>
                              </li>
                              <li>
                                Click Start Streaming to begin the live lecture.
                              </li>
                            </ul>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        onClick={handleEndLiveLecture}
                        disabled={endingLive}
                      >
                        {endingLive ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Ending...
                          </>
                        ) : (
                          "End Live Lecture"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              <p className="text-sm font-semibold mb-2">Live Stream:</p>
              <iframe
                src={`https://player.vdocipher.com/live-v2?liveId=${lecture.streamId}`}
                style={{ border: 0, width: "100%", aspectRatio: "16/9" }}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
        ) : (
          <p className="text-sm">
            Video:{" "}
            {lecture.videoUrl || lecture.joinUrl ? (
              <a
                href={lecture.videoUrl || lecture.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Watch
              </a>
            ) : (
              "No video available"
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
