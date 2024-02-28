import { PDFDocument, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Course } from "../models/course.model.js";
import axios from "axios";
import * as fontkit from "fontkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const shareCourseWebhook = async (req, res) => {
  const shareCourseWebhookUrl=process.env.Share_Course_Webhook
  try {
    const { username, email, courseThumbnail, courseTitle, name } = req.body;
    console.log(courseTitle,courseThumbnail,name,email,username)
    if (!username || !email || !name) {
      return res.status(400).json({ message: "Missing username, email, or name" });
    }

    const templatePath = join(__dirname, ".././template.pdf");
    const templateBytes = await readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontPath = join(__dirname, "../fonts/Amerso.ttf");
    const fontBytes = await readFile(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const helveticaFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const nameFontSize = 40;
    const courseTitleFontSize = 24; 
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    const nameTextWidth = name.length * nameFontSize * 0.6; 
    const nameX = (pageWidth - nameTextWidth) / 2;
    const nameY = pageHeight / 2;

    firstPage.drawText(name, {
      x: nameX,
      y: nameY+20,
      size: nameFontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    const courseTitleTextWidth = courseTitle.length * courseTitleFontSize * 0.6; 
    const courseTitleX = (pageWidth - courseTitleTextWidth) / 2-90;
    const courseTitleY = nameY - 56; 

    firstPage.drawText(courseTitle, {
      x: courseTitleX,
      y: courseTitleY,
      size: courseTitleFontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    fetch(
      shareCourseWebhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, courseThumbnail, courseTitle, name }),
      }
    )
      .then((res) => console.log("n8n sent, status:", res.status))
      .catch((err) => console.error("n8n webhook failed:", err.message));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Certificate_${name}.pdf"`);
    return res.send(Buffer.from(modifiedPdfBytes));
  } catch (error) {
    console.error("SHARE ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to share course" });
    }
  }
};

export const sendChat = async (req, res) => {
  const sendChatWebhookUrl= "https://dlms.app.n8n.cloud/webhook/6b79cdf1-4c0c-47a9-8a3a-a99159382e42/chat"
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      // return res.status(400).json({
      //   success: false,
      //   error: "userId and message are required",
      // });
    return   res.json({
  success: true,
  output:
    response.data?.reply ||
    response.data?.output ||
    JSON.stringify(response.data) ||
    "No response from bot",
});
    }

    const payload = {
      userId,
      chatInput: message,
      sessionId: userId,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending to n8n:", payload);
    const response = await axios.post(
      sendChatWebhookUrl,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("n8n response:", response.data);
    res.json({
      success: true,
      reply: response.data.reply,
      ...response.data,
    });
  } catch (error) {
    console.error("Full error:", error);
    console.error("Error response:", error.response?.data);
    res.status(500).json({
      success: false,
      error: "Failed to process chat",
      details: error.response?.data || error.message,
      statusCode: error.response?.status,
    });
  }
};

export const shareReviewWebhook = async (req, res) => {
  console.log(req.body)
    const {courseId,rating, email,comment,name} =req.body
    const username =name
    const shareReviewWebhookUrl= process.env.Share_Review_Webhook
  try {

    const course = await Course.findById(courseId);
    const n8nRes = await fetch(
      shareReviewWebhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, course, username, email }),
      }
    );

    if (!n8nRes.ok) {
      const msg = await n8nRes.text();
      throw new Error(`n8n failed: ${msg}`);
    }

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("SHARE ERROR:", error.message);
    res.status(500).json({ message: "Failed to review course" });
  }
};