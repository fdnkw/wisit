// ===============================================================
// GLOBAL CONFIGURATION
// ===============================================================
const SHEET_ID = "1Q5kGmt8SBxhfKrzsTfWhkQOm9yQ6NBtOMAF1tgoEAOA";
const SHEET_NAME = "ข้อมูลทรัพย์";
// This is the ID of the PARENT folder where AppSheet might create subfolders like "ข้อมูลทรัพย์_Images"
const ROOT_IMAGE_FOLDER_ID = "1D9toQJjRd6jfZEiLuV1Qcp70ERxd01Qv"; 

// ===============================================================
// MAIN FUNCTION TO SERVE THE WEB APP
// ===============================================================
function doGet(e) {
  try {
    const htmlOutput = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle("WISIT รับฝากขายอสังหาริมทรัพย์")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    return htmlOutput;
  } catch (error) {
    Logger.log(`Error in doGet: ${error.toString()} \nStack: ${error.stack}`);
    return HtmlService.createHtmlOutput(`<p>เกิดข้อผิดพลาดในการโหลดหน้าเว็บ: ${error.message}. กรุณาติดต่อผู้ดูแลระบบ</p>`);
  }
}

// ===============================================================
// FUNCTION TO GET A PUBLICLY ACCESSIBLE URL FOR A DRIVE FILE
// Handles file paths that might include subfolders (e.g., "subfolder/image.jpg")
// ===============================================================

function getDriveFileUrl(filePathFromSheet) {
  if (!filePathFromSheet || typeof filePathFromSheet !== 'string' || filePathFromSheet.trim() === '') {
    Logger.log(`getDriveFileUrl: Received empty or invalid filePathFromSheet: "${filePathFromSheet}"`);
    return null;
  }

  filePathFromSheet = filePathFromSheet.trim();
  let targetFolder;
  let filename;

  try {
    const rootFolder = DriveApp.getFolderById(ROOT_IMAGE_FOLDER_ID);
    if (!rootFolder) {
        Logger.log(`getDriveFileUrl: Root folder with ID "${ROOT_IMAGE_FOLDER_ID}" not found.`);
        return null;
    }
    const rootFolderName = rootFolder.getName(); // Get the name of the root folder

    // **** START: NEW LOGIC TO HANDLE PATH STARTING WITH ROOT FOLDER NAME ****
    if (filePathFromSheet.startsWith(rootFolderName + '/')) {
      // If the path from sheet starts with the root folder's name, remove it
      // e.g., if root is "ข้อมูลทรัพย์_Images" and path is "ข้อมูลทรัพย์_Images/image.jpg",
      // new path becomes "image.jpg" relative to the rootFolder.
      filePathFromSheet = filePathFromSheet.substring(rootFolderName.length + 1); 
      Logger.log(`getDriveFileUrl: Path adjusted. Original: "${filePathFromSheet_original}", New relative path: "${filePathFromSheet}" (relative to root folder "${rootFolderName}")`);
    }
    // **** END: NEW LOGIC ****


    if (filePathFromSheet.includes('/')) {
      const parts = filePathFromSheet.split('/');
      filename = parts.pop(); 
      let currentFolder = rootFolder; // Start search from the actual root folder
      
      for (const folderName of parts) {
        if (folderName === "" || folderName === ".") continue;
        // Now, 'folderName' should be a subfolder *within* the rootFolder,
        // or a sub-subfolder if the adjusted filePathFromSheet still has more parts.
        const subFolders = currentFolder.getFoldersByName(folderName.trim());
        if (subFolders.hasNext()) {
          currentFolder = subFolders.next();
        } else {
          Logger.log(`getDriveFileUrl: Subfolder "${folderName}" not found in path "${filePathFromSheet}" (after adjustment) under folder "${currentFolder.getName()}". Original sheet path: "${filePathFromSheet_original_for_error_logging_if_needed}"`);
          return null; 
        }
      }
      targetFolder = currentFolder;
    } else {
      // After adjustment, if no '/', the file is directly in the rootFolder
      targetFolder = rootFolder;
      filename = filePathFromSheet;
    }

    // ... (ส่วนที่เหลือของฟังก์ชัน getDriveFileUrl เหมือนเดิม ตั้งแต่ if (!targetFolder || !filename) เป็นต้นไป) ...
    // จนถึง return null; ของ catch (error)
    // ผมจะคัดลอกส่วนที่เหลือมาให้เพื่อความสมบูรณ์:

    if (!targetFolder || !filename) {
        Logger.log(`getDriveFileUrl: Could not determine target folder or filename for adjusted path: "${filePathFromSheet}"`);
        return null;
    }

    const files = targetFolder.getFilesByName(filename.trim());
    if (files.hasNext()) {
      const file = files.next();
      const fileUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`; 
      // Logger.log(`getDriveFileUrl: Successfully generated URL for original path "${filePathFromSheet_original_for_error_logging_if_needed}": ${fileUrl}`);
      return fileUrl;
    } else {
      Logger.log(`getDriveFileUrl: File "${filename}" not found in target folder "${targetFolder.getName()}" (adjusted path: "${filePathFromSheet}"). Target Folder ID: ${targetFolder.getId()}. Original sheet path: "${filePathFromSheet_original_for_error_logging_if_needed}"`);
      return null;
    }
  } catch (error) {
    Logger.log(`getDriveFileUrl: Error processing original path "${filePathFromSheet_original_for_error_logging_if_needed}": ${error.toString()} \nStack: ${error.stack}`);
    return null;
  }
}
// เพื่อให้ Logger.log ทำงานกับตัวแปร filePathFromSheet_original... ผมจะเพิ่มการประกาศเล็กน้อย
// แก้ไขฟังก์ชัน getDriveFileUrl อีกครั้งให้สมบูรณ์:

function getDriveFileUrl(filePathFromSheet_original) { //เปลี่ยนชื่อ parameter เพื่อเก็บค่า original
  if (!filePathFromSheet_original || typeof filePathFromSheet_original !== 'string' || filePathFromSheet_original.trim() === '') {
    Logger.log(`getDriveFileUrl: Received empty or invalid filePathFromSheet: "${filePathFromSheet_original}"`);
    return null;
  }

  let filePathFromSheet = filePathFromSheet_original.trim(); // ทำงานกับ copy
  let targetFolder;
  let filename;

  try {
    const rootFolder = DriveApp.getFolderById(ROOT_IMAGE_FOLDER_ID);
    if (!rootFolder) {
        Logger.log(`getDriveFileUrl: Root folder with ID "${ROOT_IMAGE_FOLDER_ID}" not found.`);
        return null;
    }
    const rootFolderName = rootFolder.getName();

    if (filePathFromSheet.startsWith(rootFolderName + '/')) {
      filePathFromSheet = filePathFromSheet.substring(rootFolderName.length + 1);
      Logger.log(`getDriveFileUrl: Path adjusted. Original: "${filePathFromSheet_original}", New relative path: "${filePathFromSheet}" (relative to root folder "${rootFolderName}")`);
    } else {
      Logger.log(`getDriveFileUrl: Path from sheet "${filePathFromSheet_original}" does not start with root folder name "${rootFolderName}". Assuming it's relative to root or a direct filename.`);
    }
    
    // ถ้าหลังจากปรับแล้ว filePathFromSheet เป็นค่าว่าง (เช่น Path ใน Sheet คือ "ข้อมูลทรัพย์_Images/")
    if (filePathFromSheet === "") {
        Logger.log(`getDriveFileUrl: Adjusted path is empty for original path "${filePathFromSheet_original}". Cannot determine filename.`);
        return null;
    }


    if (filePathFromSheet.includes('/')) {
      const parts = filePathFromSheet.split('/');
      filename = parts.pop(); 
      let currentFolder = rootFolder; 
      
      for (const folderName of parts) {
        if (folderName === "" || folderName === ".") continue;
        const subFolders = currentFolder.getFoldersByName(folderName.trim());
        if (subFolders.hasNext()) {
          currentFolder = subFolders.next();
        } else {
          Logger.log(`getDriveFileUrl: Subfolder "${folderName}" not found in adjusted path "${filePathFromSheet}" under folder "${currentFolder.getName()}". Original sheet path: "${filePathFromSheet_original}"`);
          return null; 
        }
      }
      targetFolder = currentFolder;
    } else {
      targetFolder = rootFolder;
      filename = filePathFromSheet;
    }

    if (!targetFolder || !filename) {
        Logger.log(`getDriveFileUrl: Could not determine target folder or filename for adjusted path: "${filePathFromSheet}". Original: "${filePathFromSheet_original}"`);
        return null;
    }

    const files = targetFolder.getFilesByName(filename.trim());
    if (files.hasNext()) {
      const file = files.next();
      const fileUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`; 
      Logger.log(`getDriveFileUrl: Successfully generated URL for original path "${filePathFromSheet_original}": ${fileUrl}`);
      return fileUrl;
    } else {
      Logger.log(`getDriveFileUrl: File "${filename}" not found in target folder "${targetFolder.getName()}" (adjusted path: "${filePathFromSheet}"). Original: "${filePathFromSheet_original}". Target Folder ID: ${targetFolder.getId()}`);
      return null;
    }
  } catch (error) {
    Logger.log(`getDriveFileUrl: Error processing original path "${filePathFromSheet_original}": ${error.toString()} \nStack: ${error.stack}`);
    return null;
  }
}

// ===============================================================
// FUNCTION TO FETCH AND PROCESS PROPERTY DATA FROM GOOGLE SHEETS
// ===============================================================
function getPropertyData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      Logger.log(`getPropertyData: Sheet "${SHEET_NAME}" not found in Spreadsheet ID "${SHEET_ID}".`);
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }

    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    if (data.length < 2) {
      Logger.log(`getPropertyData: No data (or only header row) found in sheet "${SHEET_NAME}".`);
      return []; // Return empty array if no data rows
    }

    const headers = data[0].map(header => String(header).trim());
    const properties = [];

    // --- Define column indices based on headers ---
    const idxId = headers.indexOf("รหัสทรัพย์");
    const idxType = headers.indexOf("ประเภททรัพย์");
    const idxProjectName = headers.indexOf("ชื่อโครงการ");
    const idxDescription = headers.indexOf("รายละเอียดทรัพย์");
    const idxSize = headers.indexOf("ขนาด (ตร.ว./ตร.ม.)");
    const idxLocation = headers.indexOf("สถานที่ตั้ง");
    const idxNearby = headers.indexOf("สถานที่ใกล้เคียง");
    const idxMainImage = headers.indexOf("รูปภาพ"); // Expects path like "subfolder/image.jpg" or just "image.jpg"
    const idxPrice = headers.indexOf("ราคา");
    
    const galleryImageHeaderPrefix = "ภาพประกอบ ";
    const galleryImageIndices = [];
    headers.forEach((header, index) => {
      if (header.startsWith(galleryImageHeaderPrefix)) {
        galleryImageIndices.push(index);
      }
    });

    // --- Validate essential headers ---
    if (idxId === -1) {
        Logger.log(`getPropertyData: Header "รหัสทรัพย์" not found. Available headers: [${headers.join(", ")}]`);
        throw new Error("Header 'รหัสทรัพย์' not found in the sheet.");
    }
    // Main image and price are important for display, but allow items without them to still be processed if ID exists.
    // if (idxMainImage === -1) {
    //     Logger.log(`getPropertyData: Header "รูปภาพ" not found. Available headers: [${headers.join(", ")}]`);
    //     throw new Error("Header 'รูปภาพ' not found in the sheet.");
    // }
    // if (idxPrice === -1) {
    //     Logger.log(`getPropertyData: Header "ราคา" not found. Available headers: [${headers.join(", ")}]`);
    //     throw new Error("Header 'ราคา' not found in the sheet.");
    // }


    // --- Process each row ---
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const propertyId = row[idxId] ? String(row[idxId]).trim() : null;

      if (propertyId) { // Process row only if ID exists
        const mainImageFilePath = idxMainImage !== -1 && row[idxMainImage] ? String(row[idxMainImage]).trim() : null;
        const mainImageUrl = getDriveFileUrl(mainImageFilePath);

        const galleryImageFilePaths = galleryImageIndices
                                   .map(index => row[index] ? String(row[index]).trim() : null)
                                   .filter(path => path); // Filter out null or empty paths
        
        const galleryImageUrls = galleryImageFilePaths.map(path => getDriveFileUrl(path)).filter(url => url); // Filter out null URLs

        properties.push({
          id: propertyId,
          type: idxType !== -1 && row[idxType] ? String(row[idxType]).trim() : '',
          project: idxProjectName !== -1 && row[idxProjectName] ? String(row[idxProjectName]).trim() : '',
          description: idxDescription !== -1 && row[idxDescription] ? String(row[idxDescription]).trim() : '',
          size: idxSize !== -1 && row[idxSize] ? String(row[idxSize]).trim() : '',
          location: idxLocation !== -1 && row[idxLocation] ? String(row[idxLocation]).trim() : '',
          nearby: idxNearby !== -1 && row[idxNearby] ? String(row[idxNearby]).trim() : '',
          image: mainImageUrl, // This is the URL for the main card image
          price: idxPrice !== -1 && row[idxPrice] ? (parseFloat(String(row[idxPrice]).replace(/,/g, '')) || 0) : 0, // Remove commas before parsing
          images: [mainImageUrl, ...galleryImageUrls].filter(url => url), // Array of all image URLs for the modal slider
        });
      } else {
        // Logger.log(`getPropertyData: Skipping row ${i+1} due to missing ID.`);
      }
    }
    Logger.log(`getPropertyData: Successfully processed and fetched ${properties.length} properties.`);
    return properties.reverse(); // Show newest items first

  } catch (error) {
    Logger.log(`getPropertyData: Critical error: ${error.toString()} \nStack: ${error.stack}`);
    // Return an error object that the client-side can check
    return { error: `เกิดข้อผิดพลาดร้ายแรงในการดึงข้อมูลทรัพย์สิน: ${error.message}` };
  }
}
