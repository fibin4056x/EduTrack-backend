import XLSX from "xlsx";
import mongoose from "mongoose";

import StudentModel from "./student.model.js";

const columnAliases = {
  admissionDate: [
    "admissionDate",
    "admission date",
    "date of admission",
    "dateOfAdmission",
    "joined date",
    "joining date",
  ],
  nameEnglish: [
    "nameEnglish",
    "student name",
    "student name english",
    "name english",
    "english name",
    "student",
    "full name",
    "name",
  ],
  nameArabic: [
    "nameArabic",
    "student name arabic",
    "name arabic",
    "arabic name",
  ],
  gender: ["gender", "sex"],
  dateOfBirth: [
    "dateOfBirth",
    "date of birth",
    "birth date",
    "birthdate",
    "dob",
  ],
  aadhaarNumber: [
    "aadhaarNumber",
    "aadhaar number",
    "aadhaar no",
    "aadhar number",
    "aadhar no",
  ],
  examRegisterNumber: [
    "examRegisterNumber",
    "exam register number",
    "exam register no",
    "register number",
    "register no",
    "admission number",
    "admission no",
    "adm no",
    "roll number",
    "roll no",
    "student id",
    "uid",
    "pen",
  ],
};

const requiredColumns = [
  "nameEnglish",
];

const positionalFormats = [
  [
    "admissionDate",
    "nameEnglish",
    "gender",
    "dateOfBirth",
    "aadhaarNumber",
    "examRegisterNumber",
  ],
  [
    "admissionDate",
    "nameEnglish",
    "nameArabic",
    "gender",
    "dateOfBirth",
    "aadhaarNumber",
    "examRegisterNumber",
  ],
  [
    "nameEnglish",
    "nameArabic",
    "gender",
    "dateOfBirth",
    "aadhaarNumber",
    "examRegisterNumber",
  ],
  [
    "nameEnglish",
    "gender",
    "dateOfBirth",
    "aadhaarNumber",
    "examRegisterNumber",
  ],
];

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const trimText = (value) =>
  String(value || "").trim();

const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "";

const createExamRegisterNumber = () =>
  `AUTO-${new mongoose.Types.ObjectId()
    .toString()
    .toUpperCase()}`;

const createUtcDate = (
  year,
  month,
  day
) => {
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const parseExcelDate = (value) => {
  if (!hasValue(value)) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  if (typeof value === "number") {
    const parsed =
      XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    return createUtcDate(
      parsed.y,
      parsed.m,
      parsed.d
    );
  }

  const text = trimText(value);
  const numericValue = Number(text);

  if (
    Number.isFinite(numericValue) &&
    numericValue > 0 &&
    numericValue < 100000
  ) {
    return parseExcelDate(numericValue);
  }

  const isoMatch = text.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
  );

  if (isoMatch) {
    return createUtcDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }

  const localDateMatch = text.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/
  );

  if (localDateMatch) {
    const yearText = localDateMatch[3];
    const year =
      yearText.length === 2
        ? Number(`20${yearText}`)
        : Number(yearText);

    return createUtcDate(
      year,
      Number(localDateMatch[2]),
      Number(localDateMatch[1])
    );
  }

  const parsedDate = new Date(text);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
};

const normalizeGender = (value) => {
  const gender =
    trimText(value).toLowerCase();

  if (
    gender === "m" ||
    gender === "male"
  ) {
    return "male";
  }

  if (
    gender === "f" ||
    gender === "female"
  ) {
    return "female";
  }

  if (
    gender === "o" ||
    gender === "other"
  ) {
    return "other";
  }

  return "";
};

const resolveFieldName = (header) => {
  const normalizedHeader =
    normalizeKey(header);

  if (!normalizedHeader) {
    return null;
  }

  for (const [field, aliases] of
    Object.entries(columnAliases)) {
    if (
      aliases.some(
        (alias) =>
          normalizeKey(alias) ===
          normalizedHeader
      )
    ) {
      return field;
    }
  }

  return null;
};

const countHeaderMatches = (row) =>
  row.reduce(
    (count, cell) =>
      resolveFieldName(cell)
        ? count + 1
        : count,
    0
  );

const isBlankRow = (row) =>
  row.every((value) => !hasValue(value));

const maybeRemoveSerialColumn = (rows) => {
  const sampleRows =
    rows.slice(0, 5);

  const hasSerialColumn =
    sampleRows.length > 0 &&
    sampleRows.every((row, index) => {
      const serial = Number(row[0]);

      return (
        Number.isInteger(serial) &&
        serial === index + 1
      );
    });

  return hasSerialColumn
    ? rows.map((row) => row.slice(1))
    : rows;
};

const formatRowByPosition = (row) => {
  for (const fields of positionalFormats) {
    const rowData = {};

    fields.forEach((field, index) => {
      rowData[field] = row[index] || "";
    });

    if (
      normalizeGender(rowData.gender) &&
      parseExcelDate(rowData.dateOfBirth)
    ) {
      return rowData;
    }
  }

  const fallbackData = {};

  positionalFormats[
    positionalFormats.length - 1
  ].forEach((field, index) => {
    fallbackData[field] =
      row[index] || "";
  });

  return fallbackData;
};

const extractStudentRows = (worksheet) => {
  const rows =
    XLSX.utils
      .sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      })
      .filter((row) => !isBlankRow(row));

  if (rows.length === 0) {
    return [];
  }

  const headerIndex =
    rows.findIndex(
      (row) =>
        countHeaderMatches(row) >= 1
    );

  if (headerIndex >= 0) {
    const headers =
      rows[headerIndex];

    return rows
      .slice(headerIndex + 1)
      .map((row, index) => {
        const rowData = {};

        headers.forEach(
          (header, columnIndex) => {
            const field =
              resolveFieldName(header);

            if (
              field &&
              !hasValue(rowData[field])
            ) {
              rowData[field] =
                row[columnIndex] || "";
            }
          }
        );

        return {
          rowNumber:
            headerIndex + index + 2,
          rowData,
        };
      })
      .filter(({ rowData }) =>
        Object.values(rowData).some(
          hasValue
        )
      );
  }

  return maybeRemoveSerialColumn(rows).map(
    (row, index) => ({
      rowNumber: index + 1,
      rowData:
        formatRowByPosition(row),
    })
  );
};

const getUploadDate = () => {
  const now = new Date();

  return createUtcDate(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate()
  );
};

export const formatStudentUploadRows = (
  worksheet,
  classId,
  divisionId,
  sheetLabel = ""
) => {
  const rows =
    extractStudentRows(worksheet);

  if (rows.length === 0) {
    return {
      students: [],
      errors: [
        `${sheetLabel}Excel file does not contain any student rows`,
      ],
    };
  }

  const errors = [];

  const students = rows.map(
    ({ rowNumber, rowData }) => {
      requiredColumns.forEach(
        (column) => {
          if (!hasValue(rowData[column])) {
            errors.push(
              `${sheetLabel}Row ${rowNumber}: ${column} is required`
            );
          }
        }
      );

      const admissionDate =
        hasValue(rowData.admissionDate)
          ? parseExcelDate(
              rowData.admissionDate
            )
          : getUploadDate();

      const dateOfBirth =
        parseExcelDate(
          rowData.dateOfBirth
        );

      const gender =
        normalizeGender(rowData.gender);

      if (
        hasValue(rowData.admissionDate) &&
        !admissionDate
      ) {
        errors.push(
          `${sheetLabel}Row ${rowNumber}: admissionDate is invalid`
        );
      }

      if (
        hasValue(rowData.dateOfBirth) &&
        !dateOfBirth
      ) {
        errors.push(
          `${sheetLabel}Row ${rowNumber}: dateOfBirth is invalid`
        );
      }

      if (
        hasValue(rowData.gender) &&
        !gender
      ) {
        errors.push(
          `${sheetLabel}Row ${rowNumber}: gender must be male, female, or other`
        );
      }

      return {
        classId,
        divisionId,
        admissionDate,
        nameEnglish:
          trimText(
            rowData.nameEnglish
          ),
        nameArabic:
          trimText(
            rowData.nameArabic
          ),
        gender,
        dateOfBirth,
        aadhaarNumber:
          trimText(
            rowData.aadhaarNumber
          ),
        examRegisterNumber:
          trimText(
            rowData.examRegisterNumber
          ) || createExamRegisterNumber(),
      };
    }
  );

  return {
    students,
    errors,
  };
};

export const formatStudentUploadWorkbook = (
  workbook,
  classId,
  divisionId
) => {
  const students = [];
  const errors = [];

  workbook.SheetNames.forEach(
    (sheetName) => {
      const worksheet =
        workbook.Sheets[sheetName];

      if (!worksheet) {
        return;
      }

      const result =
        formatStudentUploadRows(
          worksheet,
          classId,
          divisionId,
          `${sheetName}: `
        );

      if (
        result.errors.length === 1 &&
        result.errors[0].includes(
          "does not contain any student rows"
        )
      ) {
        return;
      }

      students.push(
        ...result.students
      );
      errors.push(...result.errors);
    }
  );

  if (
    students.length === 0 &&
    errors.length === 0
  ) {
    errors.push(
      "Excel file does not contain any student rows"
    );
  }

  return {
    students,
    errors,
  };
};

const getUploadErrorMessage = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (
    error.name === "MongoBulkWriteError" ||
    error.name ===
      "MongooseBulkWriteError"
  ) {
    return (
      error.writeErrors?.[0]?.errmsg ||
      error.message
    );
  }

  return error.message;
};

const getDuplicateValues = (values) => {
  const seen = new Set();
  const duplicates = new Set();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
};
const validateRegisterNumbers =
  async (students) => {

    const registerNumbers =
      students
        .map(
          (student) =>
            student.examRegisterNumber
        )
        .filter(
          (number) =>
            number &&
            String(number).trim() !== ""
        );



    /* =========================================
       CHECK DUPLICATES INSIDE EXCEL
    ========================================= */

    const duplicateNumbers =
      getDuplicateValues(
        registerNumbers
      );

    if (duplicateNumbers.length > 0) {

      return [
        `Duplicate examRegisterNumber in Excel: ${duplicateNumbers.join(
          ", "
        )}`,
      ];
    }



    /* =========================================
       SKIP DB CHECK IF EMPTY
    ========================================= */

    if (registerNumbers.length === 0) {
      return [];
    }



    /* =========================================
       CHECK EXISTING DB VALUES
    ========================================= */

    const existingStudents =
      await StudentModel.find({
        examRegisterNumber: {
          $in: registerNumbers,
        },
      })
        .select(
          "examRegisterNumber"
        )
        .lean();



    if (existingStudents.length > 0) {

      return [
        `Already existing examRegisterNumber: ${existingStudents
          .map(
            (student) =>
              student.examRegisterNumber
          )
          .join(", ")}`,
      ];
    }



    return [];
  };

export const bulkUploadStudents =
  async (req, res) => {
    try {
      const {
        classId,
        divisionId,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          classId
        ) ||
        !mongoose.Types.ObjectId.isValid(
          divisionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid class and division are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Excel file required",
        });
      }

      const workbook =
        XLSX.read(req.file.buffer, {
          type: "buffer",
          cellDates: true,
        });

      if (
        workbook.SheetNames.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Excel file does not contain any sheets",
        });
      }

      const {
        students,
        errors,
      } = formatStudentUploadWorkbook(
        workbook,
        classId,
        divisionId
      );

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            errors.slice(0, 5).join(", "),
          errors,
        });
      }

      const registerNumberErrors =
        await validateRegisterNumbers(
          students
        );

      if (
        registerNumberErrors.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            registerNumberErrors.join(", "),
          errors:
            registerNumberErrors,
        });
      }

      await StudentModel.insertMany(
        students,
        {
          ordered: true,
        }
      );

      return res.status(201).json({
        success: true,
        message:
          "Students uploaded successfully",
        data: {
          insertedCount:
            students.length,
        },
      });
    } catch (error) {
      console.error(error);

      const statusCode =
        error.name === "ValidationError" ||
        error.name ===
          "MongoBulkWriteError" ||
        error.name ===
          "MongooseBulkWriteError"
          ? 400
          : 500;

      return res.status(statusCode).json({
        success: false,
        message:
          statusCode === 400
            ? getUploadErrorMessage(error)
            : "Bulk upload failed",
      });
    }
  };
