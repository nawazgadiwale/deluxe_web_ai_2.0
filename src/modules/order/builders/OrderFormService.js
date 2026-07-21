import ORDER_FIELD_TYPES from "../helpers/OrderFieldTypes.js";

export default class OrderFormService {
  /*
   * =====================================================
   * Build Form
   * =====================================================
   */

  build(product) {
    return [
      this.buildCommonSection(),
      this.buildSpecificationSection(product),
      this.buildCustomerSection(),
    ];
  }

  /*
   * =====================================================
   * Common Fields
   * =====================================================
   */

  buildCommonSection() {
    return {
      id: "common",

      title: "Order Details",

      fields: [
        {
          id: "quantity",

          label: "Quantity",

          type: ORDER_FIELD_TYPES.NUMBER,

          required: true,

          min: 1,

          placeholder: "Enter quantity",
        },

        {
          id: "artworkStatus",

          label: "Artwork",

          type: ORDER_FIELD_TYPES.RADIO,

          required: true,

          options: [
            {
              label: "I already have artwork",
              value: "READY",
            },
            {
              label: "I need design assistance",
              value: "NEED_DESIGN",
            },
          ],
        },

        {
          id: "designRequirements",

          label: "Design Requirements",

          type: ORDER_FIELD_TYPES.TEXTAREA,

          required: false,

          placeholder: "Describe your design requirements...",

          visibleWhen: {
            field: "artworkStatus",
            equals: "NEED_DESIGN",
          },
        },

        {
          id: "artworkFile",

          label: "Upload Artwork",

          type: ORDER_FIELD_TYPES.FILE,

          required: false,

          accept: [
            ".pdf",
            ".ai",
            ".eps",
            ".cdr",
            ".psd",
            ".png",
            ".jpg",
            ".jpeg",
          ],

          visibleWhen: {
            field: "artworkStatus",
            equals: "READY",
          },
        },

        {
          id: "deadline",

          label: "Required Delivery Date",

          type: ORDER_FIELD_TYPES.DATE,

          required: true,
        },

        {
          id: "notes",

          label: "Additional Notes",

          type: ORDER_FIELD_TYPES.TEXTAREA,

          required: false,

          placeholder: "Anything else you'd like us to know?",
        },
      ],
    };
  }

  /*
   * =====================================================
   * Dynamic Specifications
   * =====================================================
   */

  buildSpecificationSection(product) {
    const metadata = product?.metadata ?? {};

    const requiredFields = metadata.requiredFields ?? [];

    return {
      id: "specifications",

      title: "Specifications",

      fields: requiredFields.map((field) =>
        this.createSpecificationField(field),
      ),
    };
  }

  /*
   * =====================================================
   * Customer
   * =====================================================
   */

  buildCustomerSection() {
    return {
      id: "customer",

      title: "Customer Information",

      fields: [
        {
          id: "name",

          label: "Full Name",

          type: ORDER_FIELD_TYPES.TEXT,

          required: true,

          placeholder: "Enter your name",
        },

        {
          id: "company",

          label: "Company",

          type: ORDER_FIELD_TYPES.TEXT,

          required: false,

          placeholder: "Company (Optional)",
        },

        {
          id: "phone",

          label: "Phone Number",

          type: ORDER_FIELD_TYPES.PHONE,

          required: true,

          placeholder: "Enter phone number",
        },

        {
          id: "email",

          label: "Email",

          type: ORDER_FIELD_TYPES.EMAIL,

          required: false,

          placeholder: "Enter email address",
        },
      ],
    };
  }

  /*
   * =====================================================
   * Dynamic Field Generator
   * =====================================================
   */

  createSpecificationField(field) {
    const type = (field.type ?? ORDER_FIELD_TYPES.TEXT).toLowerCase();

    /*
     * =====================================================
     * Boolean
     * =====================================================
     */

    if (type === "boolean") {
      return {
        id: field.name,

        label: field.label ?? this.formatLabel(field.name),

        type: ORDER_FIELD_TYPES.CHECKBOX,

        required: field.required ?? false,
      };
    }

    /*
     * =====================================================
     * Select
     * =====================================================
     */

    if (type === "select") {
      return {
        id: field.name,

        label: field.label ?? this.formatLabel(field.name),

        type: ORDER_FIELD_TYPES.SELECT,

        required: field.required ?? true,

        options: (field.options ?? []).map((option) =>
          typeof option === "string"
            ? {
                label: option,
                value: option,
              }
            : option,
        ),
      };
    }

    /*
     * =====================================================
     * Default
     * =====================================================
     */

    return {
      id: field.name,

      label: field.label ?? this.formatLabel(field.name),

      type,

      required: field.required ?? true,

      placeholder: field.placeholder ?? `Enter ${this.formatLabel(field.name)}`,

      options: (field.options ?? []).map((option) =>
        typeof option === "string"
          ? {
              label: option,
              value: option,
            }
          : option,
      ),

      min: field.min,

      max: field.max,

      accept: field.accept,

      visibleWhen: field.visibleWhen,
    };
  }
  /*
   * =====================================================
   * Helpers
   * =====================================================
   */

  formatLabel(text) {
    return text
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (char) => char.toUpperCase());
  }
}
