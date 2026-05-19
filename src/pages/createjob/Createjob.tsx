import PageLayout from "@/components/layout/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DatePicker } from "@/components/ui/datepicker";
import RtfQuill from "@/components/ui/rtf-quill";
import Toggle from "@/components/ui/toggle";
import IoTrashBin from "@/assets/icons/IoTrashBin.png";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import {
  apiGetCompanyIdByUserId,
  apiGetProfileCompanyProfile,
} from "@/services/profileService";
import CreateJobAddSkillPopup from "./CreateJobAddSkillPopup";
import {
  apiCreateJob,
  apiPatchJobById,
  apiPatchJobStatusById,
  apiGetJobById,
  apiGetUtilityOptionType,
} from "@/services/createjobService";
import {
  apiGetUtilityDistrictsByProvinceCode,
  apiGetUtilityPostalCodesBySubDistrictCode,
  apiGetUtilityProvinces,
  apiGetUtilitySubDistrictsByDistrictCode,
} from "@/services/utilityService";
import type {
  AddressAutoFillOption,
  AdditionQuestionType,
  AdditionQuestionSection,
  SortableAnswerItemProps,
  CreateJobRequest,
  SkillRequest,
  UtilityWorkOption,
  UtilityWorkType,
} from "@/types/createJobTypes";
import type {
  UtilityDistrictItem,
  UtilityPostalCodeItem,
  UtilityProvinceItem,
  UtilitySubDistrictItem,
} from "@/types/utilityTypes";

const initialAdditionQuestions: AdditionQuestionSection[] = [];

const additionQuestionTypeLabel: Record<AdditionQuestionType, string> = {
  open: "Open Answer",
  radio: "Radio Answer",
  checkbox: "Checkbox Answer",
};

function SortableAnswerItem({ answer, onChange }: SortableAnswerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: answer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        aria-label="Reorder answer"
        className="text-muted-foreground hover:text-foreground cursor-grab rounded-md p-1 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Textarea
        value={answer.text}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 resize-y"
      />
    </div>
  );
}

function createAdditionQuestionSection(
  type: AdditionQuestionType,
  id: string,
): AdditionQuestionSection {
  const defaultQuestion = "";
  const defaultAnswer = "";

  if (type === "open") {
    return {
      id,
      type,
      question: defaultQuestion,
      answers: [],
    };
  }

  if (type === "radio") {
    return {
      id,
      type,
      question: defaultQuestion,
      answers: Array.from({ length: 3 }, (_, index) => ({
        id: `${id}-item-${index + 1}`,
        text: defaultAnswer,
      })),
    };
  }

  return {
    id,
    type,
    question: defaultQuestion,
    answers: Array.from({ length: 2 }, (_, index) => ({
      id: `${id}-item-${index + 1}`,
      text: defaultAnswer,
    })),
    maxSelect: "2",
  };
}

type AdditionFileSection = {
  id: string;
  fileType: string;
  label: string;
  description: string;
};

const createAdditionFileSection = (id: string): AdditionFileSection => ({
  id,
  fileType: "",
  label: "",
  description: "",
});

const createEmptyCompanyAddress = (): AddressAutoFillOption => ({
  postalCode: "",
  addressLine: "",
  no: "",
  moo: "",
  soi: "",
  street: "",
  province: "",
  district: "",
  subDistrict: "",
});

export default function CreatejobPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill =
    (location.state as { prefill?: Record<string, unknown> } | null)?.prefill ??
    null;
  const editJobIdFromQuery = new URLSearchParams(location.search).get("jobId");
  const editJobId =
    editJobIdFromQuery ??
    (prefill?.jobId != null ? String(prefill.jobId) : null);
  // Company state
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyAddress, setCompanyAddress] =
    useState<AddressAutoFillOption | null>(null);
  const [companyAddressCodes, setCompanyAddressCodes] = useState<{
    subDistrictCode: number;
    districtCode: number;
    provinceCode: number;
    countryCode: number;
    postalCodeNum: number;
  } | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<UtilityProvinceItem[]>(
    [],
  );
  const [districtOptions, setDistrictOptions] = useState<UtilityDistrictItem[]>(
    [],
  );
  const [subDistrictOptions, setSubDistrictOptions] = useState<
    UtilitySubDistrictItem[]
  >([]);
  const [postalCodeOptions, setPostalCodeOptions] = useState<
    UtilityPostalCodeItem[]
  >([]);
  // Form States
  const [jobName, setJobName] = useState<string>(
    typeof prefill?.name === "string" ? prefill.name : "",
  );
  const [workOption, setWorkOption] = useState<string>(
    prefill?.work_option_id != null ? String(prefill.work_option_id) : "",
  );
  const [workCategory, setWorkCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    typeof prefill?.start_apply === "string" && prefill.start_apply
      ? new Date(prefill.start_apply)
      : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    typeof prefill?.end_apply === "string" && prefill.end_apply
      ? new Date(prefill.end_apply)
      : undefined,
  );
  const [jobDescription, setJobDescription] = useState<string>(
    typeof prefill?.description_rtf === "string"
      ? prefill.description_rtf
      : typeof prefill?.description === "string"
        ? prefill.description
        : "",
  );
  const [coverLetter, setCoverLetter] = useState(
    typeof prefill?.cover_letter === "boolean" ? prefill.cover_letter : true,
  );
  const [workExperience, setWorkExperience] = useState(
    typeof prefill?.work_experience === "boolean"
      ? prefill.work_experience
      : true,
  );
  const [education, setEducation] = useState(
    typeof prefill?.education === "boolean" ? prefill.education : true,
  );
  const [additionFiles, setAdditionFiles] = useState<AdditionFileSection[]>(
    () => {
      const source = prefill?.addition_file;
      if (Array.isArray(source) && source.length > 0) {
        return source.map((item, index) => {
          const candidate = item as {
            id?: string | number;
            type?: number;
            label?: string;
            description?: string;
          };
          const typeFromApi: Record<number, string> = {
            1: "pdf",
            2: "jpeg",
            3: "txt",
          };
          return {
            id: String(candidate.id ?? `addition-file-${index + 1}`),
            fileType: typeFromApi[candidate.type ?? 0] ?? "",
            label: candidate.label ?? "",
            description: candidate.description ?? "",
          };
        });
      }
      return [];
    },
  );
  const [skills, setSkills] = useState<SkillRequest[]>(
    Array.isArray(prefill?.skills) ? (prefill.skills as SkillRequest[]) : [],
  );
  const [isAddSkillPopupOpen, setIsAddSkillPopupOpen] = useState(false);
  const [workOptions, setWorkOptions] = useState<UtilityWorkOption[]>([]);
  const [workTypes, setWorkTypes] = useState<UtilityWorkType[]>([]);
  const [workTypeId, setWorkTypeId] = useState<string>(
    prefill?.work_type_id != null ? String(prefill.work_type_id) : "",
  );
  const [additionQuestions, setAdditionQuestions] = useState<
    AdditionQuestionSection[]
  >(initialAdditionQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const additionQuestionRefs = useRef<Record<string, HTMLDivElement | null>>(
    {},
  );
  const previousQuestionPositions = useRef<Record<string, number>>({});
  const additionQuestionIdCounter = useRef(initialAdditionQuestions.length);
  const additionQuestionAnswerIdCounter = useRef(
    initialAdditionQuestions.reduce(
      (count, section) => count + section.answers.length,
      0,
    ),
  );
  const additionFileIdCounter = useRef(additionFiles.length);

  const answerDndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const gradientBorderStyle = {
    borderColor: "transparent",
    backgroundImage:
      "linear-gradient(var(--background), var(--background)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };

  const gradientTextStyle = {
    backgroundImage: "var(--gradient-primary)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  const mapAdditionQuestionTypeToApi = (type: AdditionQuestionType): number => {
    // Backend: 1=select-one, 2=multi-select, 3=open-answer
    const typeMap: Record<AdditionQuestionType, number> = {
      radio: 1,
      checkbox: 2,
      open: 3,
    };
    return typeMap[type];
  };

  const mapAdditionFileTypeToApi = (type: string): number => {
    // Backend enum: 1=pdf, 2=jpeg/png, 3=work/txt
    const map: Record<string, number> = {
      pdf: 1,
      jpeg: 2,
      png: 2,
      txt: 3,
      work: 3,
    };
    return map[type] || 0;
  };

  const updateCompanyAddressField = (
    field: keyof AddressAutoFillOption,
    value: string,
  ) => {
    setCompanyAddress((previous) => ({
      ...(previous ?? createEmptyCompanyAddress()),
      [field]: value,
    }));

    if (field === "postalCode") {
      setCompanyAddressCodes((previous) => ({
        subDistrictCode: previous?.subDistrictCode ?? 0,
        districtCode: previous?.districtCode ?? 0,
        provinceCode: previous?.provinceCode ?? 0,
        countryCode: previous?.countryCode ?? 0,
        postalCodeNum: Number.parseInt(value, 10) || 0,
      }));
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinceOptions.find(
      (province) => String(province.province_code) === value,
    );

    setCompanyAddress((previous) => ({
      ...(previous ?? createEmptyCompanyAddress()),
      province:
        selectedProvince?.province_name_en ??
        selectedProvince?.province_name_th ??
        "",
      district: "",
      subDistrict: "",
      postalCode: "",
    }));

    setCompanyAddressCodes((previous) => ({
      subDistrictCode: 0,
      districtCode: 0,
      provinceCode: Number.parseInt(value, 10) || 0,
      countryCode:
        selectedProvince?.country_id ?? previous?.countryCode ?? 76400,
      postalCodeNum: 0,
    }));

    setDistrictOptions([]);
    setSubDistrictOptions([]);
    setPostalCodeOptions([]);
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districtOptions.find(
      (district) => String(district.district_code) === value,
    );

    setCompanyAddress((previous) => ({
      ...(previous ?? createEmptyCompanyAddress()),
      district:
        selectedDistrict?.district_name_en ??
        selectedDistrict?.district_name_th ??
        "",
      subDistrict: "",
      postalCode: "",
    }));

    setCompanyAddressCodes((previous) => ({
      subDistrictCode: 0,
      districtCode: Number.parseInt(value, 10) || 0,
      provinceCode: previous?.provinceCode ?? 0,
      countryCode: previous?.countryCode ?? 76400,
      postalCodeNum: 0,
    }));

    setSubDistrictOptions([]);
    setPostalCodeOptions([]);
  };

  const handleSubDistrictChange = (value: string) => {
    const selectedSubDistrict = subDistrictOptions.find(
      (subDistrict) => String(subDistrict.sub_district_code) === value,
    );

    setCompanyAddress((previous) => ({
      ...(previous ?? createEmptyCompanyAddress()),
      subDistrict:
        selectedSubDistrict?.sub_district_name_en ??
        selectedSubDistrict?.sub_district_name_th ??
        "",
      postalCode: "",
    }));

    setCompanyAddressCodes((previous) => ({
      subDistrictCode: Number.parseInt(value, 10) || 0,
      districtCode: previous?.districtCode ?? 0,
      provinceCode: previous?.provinceCode ?? 0,
      countryCode: previous?.countryCode ?? 76400,
      postalCodeNum: 0,
    }));

    setPostalCodeOptions([]);
  };

  const handlePostalCodeChange = (value: string) => {
    setCompanyAddress((previous) => ({
      ...(previous ?? createEmptyCompanyAddress()),
      postalCode: value,
    }));

    setCompanyAddressCodes((previous) => ({
      subDistrictCode: previous?.subDistrictCode ?? 0,
      districtCode: previous?.districtCode ?? 0,
      provinceCode: previous?.provinceCode ?? 0,
      countryCode: previous?.countryCode ?? 76400,
      postalCodeNum: Number.parseInt(value, 10) || 0,
    }));
  };

  const buildCreateJobPayloadForSubmit = (): CreateJobRequest => {
    const additionQuestionsPayload = additionQuestions.map(
      (section, questionIndex) => ({
        id: questionIndex,
        type: mapAdditionQuestionTypeToApi(section.type),
        question: section.question,
        options: section.answers.map((answer, answerIndex) => ({
          id: answerIndex,
          label: answer.text,
        })),
        max_select:
          section.type === "checkbox" ? Number(section.maxSelect || 1) : 1,
      }),
    );

    const additionFilePayload = additionFiles
      .filter(
        (item) =>
          item.label.trim() || item.description.trim() || item.fileType.trim(),
      )
      .map((item, index) => ({
        id: index,
        type: mapAdditionFileTypeToApi(item.fileType),
        label: item.label,
        description: item.description,
      }));

    return {
      name: jobName,
      description: jobDescription || "",
      description_rtf: jobDescription,
      start_apply: startDate!.toISOString(),
      end_apply: endDate!.toISOString(),
      cover_letter: coverLetter,
      work_experience: workExperience,
      education: education,
      company_id: companyId ?? "",
      address: {
        address_line: companyAddress?.addressLine ?? "",
        no: companyAddress?.no ?? "",
        moo: companyAddress?.moo ?? "",
        soi: companyAddress?.soi ?? "",
        street: companyAddress?.street ?? "",
        sub_district_code: companyAddressCodes?.subDistrictCode ?? 0,
        district_code: companyAddressCodes?.districtCode ?? 0,
        province_code: companyAddressCodes?.provinceCode ?? 0,
        country_code: companyAddressCodes?.countryCode ?? 0,
        postal_code: companyAddressCodes?.postalCodeNum ?? 0,
      },
      category_ids: [1],
      work_option_ids: workOption ? [parseInt(workOption)] : [],
      work_type_ids: workTypeId ? [parseInt(workTypeId)] : [],
      skills,
      addition_questions: additionQuestionsPayload,
      addition_file: additionFilePayload,
    };
  };

  const validateJobForm = (): boolean => {
    if (!jobName.trim()) {
      toast.error("Job name is required");
      return false;
    }
    if (!startDate || !endDate) {
      toast.error("Start and end apply dates are required");
      return false;
    }
    if (!companyAddress) {
      toast.error("Address is required");
      return false;
    }
    if (skills.length === 0) {
      toast.error("At least one skill is required");
      return false;
    }
    return true;
  };

  const addAdditionFile = () => {
    additionFileIdCounter.current += 1;
    setAdditionFiles((previous) => [
      ...previous,
      createAdditionFileSection(
        `addition-file-${additionFileIdCounter.current}`,
      ),
    ]);
  };

  const removeAdditionFile = (sectionId: string) => {
    setAdditionFiles((previous) =>
      previous.filter((section) => section.id !== sectionId),
    );
  };

  const updateAdditionFile = (
    sectionId: string,
    field: "label" | "description" | "fileType",
    value: string,
  ) => {
    setAdditionFiles((previous) =>
      previous.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  };

  const moveAdditionQuestion = (fromIndex: number, toIndex: number) => {
    setAdditionQuestions((previous) => {
      if (toIndex < 0 || toIndex >= previous.length) {
        return previous;
      }

      const nextQuestions = [...previous];
      const [movedQuestion] = nextQuestions.splice(fromIndex, 1);
      nextQuestions.splice(toIndex, 0, movedQuestion);
      return nextQuestions;
    });
  };

  const addAdditionQuestion = (type: AdditionQuestionType) => {
    additionQuestionIdCounter.current += 1;
    const sectionId = `${type}-answer-${additionQuestionIdCounter.current}`;
    const newSection = createAdditionQuestionSection(type, sectionId);
    additionQuestionAnswerIdCounter.current += newSection.answers.length;

    setAdditionQuestions((previous) => [...previous, newSection]);
  };

  const updateAdditionQuestion = (sectionId: string, question: string) => {
    setAdditionQuestions((previous) =>
      previous.map((section) =>
        section.id === sectionId ? { ...section, question } : section,
      ),
    );
  };

  const updateAdditionQuestionAnswer = (
    sectionId: string,
    answerId: string,
    answer: string,
  ) => {
    setAdditionQuestions((previous) =>
      previous.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          answers: section.answers.map((currentAnswer) =>
            currentAnswer.id === answerId
              ? { ...currentAnswer, text: answer }
              : currentAnswer,
          ),
        };
      }),
    );
  };

  const addAnswerToAdditionQuestion = (sectionId: string) => {
    additionQuestionAnswerIdCounter.current += 1;
    const answerId = `${sectionId}-item-${additionQuestionAnswerIdCounter.current}`;

    setAdditionQuestions((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              answers: [
                ...section.answers,
                {
                  id: answerId,
                  text: "",
                },
              ],
            }
          : section,
      ),
    );
  };

  const moveAdditionQuestionAnswer = (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => {
    setAdditionQuestions((previous) =>
      previous.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const fromIndex = section.answers.findIndex(
          (answer) => answer.id === activeId,
        );
        const toIndex = section.answers.findIndex(
          (answer) => answer.id === overId,
        );

        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return section;
        }

        return {
          ...section,
          answers: arrayMove(section.answers, fromIndex, toIndex),
        };
      }),
    );
  };

  const handleAnswerDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    moveAdditionQuestionAnswer(sectionId, String(active.id), String(over.id));
  };

  const updateAdditionQuestionMaxSelect = (
    sectionId: string,
    maxSelect: string,
  ) => {
    setAdditionQuestions((previous) =>
      previous.map((section) =>
        section.id === sectionId ? { ...section, maxSelect } : section,
      ),
    );
  };

  const removeAdditionQuestion = (sectionId: string) => {
    setAdditionQuestions((previous) =>
      previous.filter((section) => section.id !== sectionId),
    );
    delete additionQuestionRefs.current[sectionId];
  };

  const addSkill = (skill: SkillRequest) => {
    setSkills((previous) => [
      ...previous,
      { ...skill, index: previous.length },
    ]);
  };

  const removeSkill = (index: number) => {
    setSkills((previous) =>
      previous
        .filter((_, currentIndex) => currentIndex !== index)
        .map((s, i) => ({ ...s, index: i })),
    );
  };

  const handleCreateJob = async () => {
    if (!validateJobForm()) return;
    if (!companyId) {
      toast.error("Company ID is missing. Please sign in again.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiCreateJob(
        companyId,
        buildCreateJobPayloadForSubmit(),
      );
      const jobId = response.data?.id;

      if (jobId) {
        await apiPatchJobStatusById(jobId, { status: 3 });
        setCreatedJobId(jobId);
      }
      navigate("/jobmonitor");

      toast.success("Job created successfully!");
    } catch {
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!createdJobId || !validateJobForm()) return;
    try {
      setIsLoading(true);
      await apiPatchJobById(createdJobId, buildCreateJobPayloadForSubmit());
      toast.success("Job saved successfully!");
    } catch {
      toast.error("Failed to save job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const authUser = useAuthStore.getState().user;
      const userId = authUser?.id;
      if (!userId) {
        setCompanyId("");
        setProvinceOptions([]);
        setWorkOptions([]);
        setWorkTypes([]);
        return;
      }
      try {
        // Fetch work options/types and company data in parallel
        const [optionTypeResult, companyIdResult, provincesResult] =
          await Promise.all([
            apiGetUtilityOptionType(),
            apiGetCompanyIdByUserId(userId),
            apiGetUtilityProvinces(),
          ]);
        if (optionTypeResult.data) {
          const d = optionTypeResult.data;
          setWorkOptions(d.work_options ?? d.work_option ?? []);
          setWorkTypes(d.work_types ?? d.work_type ?? []);
        }
        setProvinceOptions(provincesResult.data ?? []);
        const cId = companyIdResult.data?.company_id;
        if (!cId) return;
        setCompanyId(cId);

        // Edit mode: if job id is provided, load full job detail and set form for patch
        if (editJobId) {
          const jobDetailResult = await apiGetJobById(editJobId);
          const jobDetail = jobDetailResult.data;

          if (jobDetail) {
            setCreatedJobId(jobDetail.id);
            setJobName(jobDetail.name ?? "");
            setWorkOption(
              jobDetail.work_options?.[0]?.work_option_id
                ? String(jobDetail.work_options[0].work_option_id)
                : "",
            );
            setWorkTypeId(
              jobDetail.work_types?.[0]?.work_type_id
                ? String(jobDetail.work_types[0].work_type_id)
                : "",
            );
            setStartDate(
              jobDetail.start_apply
                ? new Date(jobDetail.start_apply)
                : undefined,
            );
            setEndDate(
              jobDetail.end_apply ? new Date(jobDetail.end_apply) : undefined,
            );
            setJobDescription(
              jobDetail.description_rtf || jobDetail.description || "",
            );
            setCoverLetter(Boolean(jobDetail.cover_letter));
            setWorkExperience(Boolean(jobDetail.work_experience));
            setEducation(Boolean(jobDetail.education));
            setSkills(
              (jobDetail.skills ?? []).map((skill, index) => ({
                index,
                skill_id: skill.skill_id,
                skill_name: skill.skill_name,
              })),
            );

            setCompanyAddress({
              addressLine: jobDetail.address_line ?? "",
              no: jobDetail.no ?? "",
              moo: jobDetail.moo ?? "",
              soi: jobDetail.soi ?? "",
              street: jobDetail.street ?? "",
              province:
                (typeof prefill?.province_name === "string"
                  ? prefill.province_name
                  : "") || "",
              district:
                (typeof prefill?.district_name === "string"
                  ? prefill.district_name
                  : "") || "",
              subDistrict:
                (typeof prefill?.sub_district_name === "string"
                  ? prefill.sub_district_name
                  : "") || "",
              postalCode: String(jobDetail.postal_code ?? ""),
            });
            setCompanyAddressCodes({
              subDistrictCode: jobDetail.sub_district_code ?? 0,
              districtCode: jobDetail.district_code ?? 0,
              provinceCode: jobDetail.province_code ?? 0,
              countryCode: jobDetail.country_code ?? 76400,
              postalCodeNum: jobDetail.postal_code ?? 0,
            });
            return;
          }
        }

        const profileResult = await apiGetProfileCompanyProfile(cId);
        const data = profileResult.data;
        if (!data) return;
        setCompanyAddress({
          addressLine: data.address_line ?? "",
          no: data.no ?? "",
          moo: data.moo ?? "",
          soi: data.soi ?? "",
          street: data.street ?? "",
          province: data.province?.province_name_en ?? "",
          district: data.district?.district_name_en ?? "",
          subDistrict: data.sub_district?.sub_district_name_en ?? "",
          postalCode: String(data.postal_code?.postal_code ?? ""),
        });
        setCompanyAddressCodes({
          subDistrictCode: data.sub_district?.sub_district_code ?? 0,
          districtCode: data.district?.district_code ?? 0,
          provinceCode: data.province?.province_code ?? 0,
          countryCode: data.country?.country_code ?? 76400,
          postalCodeNum: parseInt(
            String(data.postal_code?.postal_code ?? "0"),
            10,
          ),
        });
      } catch {
        // initial data fetch failure is non-blocking
      }
    };
    void fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const nextPositions: Record<string, number> = {};

    additionQuestions.forEach((section) => {
      const element = additionQuestionRefs.current[section.id];
      if (!element) {
        return;
      }

      const nextTop = element.getBoundingClientRect().top;
      nextPositions[section.id] = nextTop;

      const previousTop = previousQuestionPositions.current[section.id];
      if (previousTop === undefined) {
        return;
      }

      const translateY = previousTop - nextTop;
      if (translateY === 0) {
        return;
      }

      element.animate(
        [
          { transform: `translateY(${translateY}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: 280,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    });

    previousQuestionPositions.current = nextPositions;
  }, [additionQuestions]);

  useEffect(() => {
    const provinceCode = companyAddressCodes?.provinceCode ?? 0;
    if (!provinceCode) {
      setDistrictOptions([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const result = await apiGetUtilityDistrictsByProvinceCode(provinceCode);
        setDistrictOptions(result.data?.districts ?? []);
      } catch {
        setDistrictOptions([]);
      }
    };

    void fetchDistricts();
  }, [companyAddressCodes?.provinceCode]);

  useEffect(() => {
    const districtCode = companyAddressCodes?.districtCode ?? 0;
    if (!districtCode) {
      setSubDistrictOptions([]);
      return;
    }

    const fetchSubDistricts = async () => {
      try {
        const result =
          await apiGetUtilitySubDistrictsByDistrictCode(districtCode);
        setSubDistrictOptions(result.data?.sub_districts ?? []);
      } catch {
        setSubDistrictOptions([]);
      }
    };

    void fetchSubDistricts();
  }, [companyAddressCodes?.districtCode]);

  useEffect(() => {
    const subDistrictCode = companyAddressCodes?.subDistrictCode ?? 0;
    if (!subDistrictCode) {
      setPostalCodeOptions([]);
      return;
    }

    const fetchPostalCodes = async () => {
      try {
        const result =
          await apiGetUtilityPostalCodesBySubDistrictCode(subDistrictCode);
        setPostalCodeOptions(result.data ?? []);
      } catch {
        setPostalCodeOptions([]);
      }
    };

    void fetchPostalCodes();
  }, [companyAddressCodes?.subDistrictCode]);

  return (
    <PageLayout>
      <div className="w-full bg-background px-6 py-6">
        {/* Container */}
        <div className="mx-auto my-[-0%] max-w-6xl ml-4">
          {/* Breadcrumb */}
          <div className="mb-3 mx-[1%]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/applymonitor">Apply</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create Job</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-medium mt-[3%] ml-[-1%]">Create Job</h1>

          {/* Basic Information */}
          <section className="mt-[1%]">
            <h2 className="mb-4  text-lg font-medium gradient-text inline-block">
              Basic Information
            </h2>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="md:col-span-6">
                <label className="text-sm  dark:text-accent">Job name</label>
                <Input
                  placeholder="Personal Assistant 25 - 35 K (WFH 80%)"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">Work Option</label>
                <Select value={workOption} onValueChange={setWorkOption}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {workOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.text_eng}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">Work Type</label>
                <Select value={workTypeId} onValueChange={setWorkTypeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((wt) => (
                      <SelectItem key={wt.id} value={String(wt.id)}>
                        {wt.text_eng}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">Open To</label>
                <Select value={workTypeId} onValueChange={setWorkTypeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((wt) => (
                      <SelectItem key={wt.id} value={String(wt.id)}>
                        {wt.text_eng}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">
                  Work Category
                </label>
                <Select value={workCategory} onValueChange={setWorkCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-development">
                      Software Development
                    </SelectItem>
                    <SelectItem value="web-development">
                      Web Development
                    </SelectItem>
                    <SelectItem value="mobile-development">
                      Mobile Development
                    </SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                    <SelectItem value="graphic-design">
                      Graphic Design
                    </SelectItem>
                    <SelectItem value="digital-marketing">
                      Digital Marketing
                    </SelectItem>
                    <SelectItem value="content-writing">
                      Content Writing
                    </SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="customer-service">
                      Customer Service
                    </SelectItem>
                    <SelectItem value="human-resources">
                      Human Resources
                    </SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="project-management">
                      Project Management
                    </SelectItem>
                    <SelectItem value="business-analyst">
                      Business Analyst
                    </SelectItem>
                    <SelectItem value="quality-assurance">
                      Quality Assurance
                    </SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="administrative">
                      Administrative
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">Start Apply</label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  pairedDate={endDate}
                  type="start"
                  placeholder="Pick a date"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm dark:text-accent">End Apply</label>
                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  pairedDate={startDate}
                  type="end"
                  placeholder="Pick a date"
                />
              </div>
            </div>
          </section>

          {/*  Address Information  */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-medium">Address Information</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <div className="md:col-span-3">
                <label className="text-sm dark:text-accent">Address line</label>
                <Input
                  value={companyAddress?.addressLine ?? ""}
                  placeholder="address line"
                  onChange={(event) =>
                    updateCompanyAddressField("addressLine", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  No.
                </label>
                <Input
                  value={companyAddress?.no ?? ""}
                  placeholder="no."
                  onChange={(event) =>
                    updateCompanyAddressField("no", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Moo
                </label>
                <Input
                  value={companyAddress?.moo ?? ""}
                  placeholder="moo"
                  onChange={(event) =>
                    updateCompanyAddressField("moo", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Soi
                </label>
                <Input
                  value={companyAddress?.soi ?? ""}
                  placeholder="soi"
                  onChange={(event) =>
                    updateCompanyAddressField("soi", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Street
                </label>
                <Input
                  value={companyAddress?.street ?? ""}
                  placeholder="street"
                  onChange={(event) =>
                    updateCompanyAddressField("street", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Province
                </label>
                <Select
                  value={String(companyAddressCodes?.provinceCode ?? "")}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinceOptions.map((province) => (
                      <SelectItem
                        key={province.province_code}
                        value={String(province.province_code)}
                      >
                        {province.province_name_en || province.province_name_th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  District
                </label>
                <Select
                  value={String(companyAddressCodes?.districtCode ?? "")}
                  onValueChange={handleDistrictChange}
                  disabled={!companyAddressCodes?.provinceCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district) => (
                      <SelectItem
                        key={district.district_code}
                        value={String(district.district_code)}
                      >
                        {district.district_name_en || district.district_name_th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Sub-district
                </label>
                <Select
                  value={String(companyAddressCodes?.subDistrictCode ?? "")}
                  onValueChange={handleSubDistrictChange}
                  disabled={!companyAddressCodes?.districtCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sub-district" />
                  </SelectTrigger>
                  <SelectContent>
                    {subDistrictOptions.map((subDistrict) => (
                      <SelectItem
                        key={subDistrict.sub_district_code}
                        value={String(subDistrict.sub_district_code)}
                      >
                        {subDistrict.sub_district_name_en ||
                          subDistrict.sub_district_name_th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-foreground dark:text-accent">
                  Postal code
                </label>
                <Select
                  value={companyAddress?.postalCode ?? ""}
                  onValueChange={handlePostalCodeChange}
                  disabled={!companyAddressCodes?.subDistrictCode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select postal code" />
                  </SelectTrigger>
                  <SelectContent>
                    {postalCodeOptions.map((postalCodeItem) => (
                      <SelectItem
                        key={postalCodeItem.id}
                        value={postalCodeItem.postal_code}
                      >
                        {postalCodeItem.postal_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Address is auto-filled from your company profile.
            </p>
          </section>
          {/* ===== Skills ===== */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Skill Use</h2>

            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <div
                  key={`${skill.skill_id}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm"
                  style={gradientBorderStyle}
                >
                  <span style={gradientTextStyle}>{skill.skill_name}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    aria-label={`Remove ${skill.skill_name}`}
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <Button
                variant="default"
                size="sm"
                type="button"
                onClick={() => setIsAddSkillPopupOpen(true)}
                className="rounded-full text-white "
                style={{ background: "var(--gradient-primary)" }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            </div>

            <CreateJobAddSkillPopup
              open={isAddSkillPopupOpen}
              onOpenChange={setIsAddSkillPopupOpen}
              onSubmit={addSkill}
            />
          </section>

          {/*  Job Description  */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Job Description</h2>

            <RtfQuill
              value={jobDescription}
              onChange={setJobDescription}
              className="min-h-56 w-full rounded-md border bg-background"
            />
          </section>

          {/* ===== Profile Need ===== */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-medium gradient-text inline-block">
              Profile Need
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <Toggle checked={coverLetter} onChange={setCoverLetter} />
                Cover letter
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Toggle checked={workExperience} onChange={setWorkExperience} />
                Work Experience
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Toggle checked={education} onChange={setEducation} />
                Education
              </label>
            </div>
          </section>

          {/* ===== Addition Question ===== */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-medium gradient-text inline-block">
              Addition Question
            </h2>

            <div className="space-y-4">
              {additionQuestions.map((section, index) => (
                <div
                  key={section.id}
                  ref={(element) => {
                    additionQuestionRefs.current[section.id] = element;
                  }}
                  className="rounded-xl border bg-background p-4 shadow-sm will-change-transform"
                >
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Type: {additionQuestionTypeLabel[section.type]}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => moveAdditionQuestion(index, index - 1)}
                        disabled={index === 0}
                        className="hover:text-foreground inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronUp className="h-5 w-5" />
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAdditionQuestion(index, index + 1)}
                        disabled={index === additionQuestions.length - 1}
                        className="hover:text-foreground inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronDown className="h-5 w-5" />
                        Move Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAdditionQuestion(section.id)}
                        className="hover:text-foreground inline-flex items-center gap-1"
                        aria-label="Delete"
                      >
                        <img
                          src={IoTrashBin}
                          alt="Delete"
                          className="h-4 w-4"
                        />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm dark:text-accent">
                        Question
                      </label>
                      <Textarea
                        value={section.question}
                        onChange={(event) =>
                          updateAdditionQuestion(section.id, event.target.value)
                        }
                        className="min-h-10 resize-y"
                      />
                    </div>

                    {section.type === "open" ? null : (
                      <div>
                        <label className="text-sm dark:text-accent">
                          Answer
                        </label>
                        <DndContext
                          sensors={answerDndSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) =>
                            handleAnswerDragEnd(section.id, event)
                          }
                        >
                          <SortableContext
                            items={section.answers.map((answer) => answer.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="mt-2 space-y-2">
                              {section.answers.map((answer) => (
                                <SortableAnswerItem
                                  key={answer.id}
                                  answer={answer}
                                  onChange={(value) =>
                                    updateAdditionQuestionAnswer(
                                      section.id,
                                      answer.id,
                                      value,
                                    )
                                  }
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>

                        <div
                          className={`mt-3 flex ${section.type === "checkbox" ? "items-center justify-between" : "justify-center"}`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              addAnswerToAdditionQuestion(section.id)
                            }
                            className="rounded-full border border-muted-foreground text-muted-foreground hover:bg-muted"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Answer
                          </Button>

                          {section.type === "checkbox" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Can Select Up To
                              </span>
                              <Select
                                value={section.maxSelect || "3"}
                                onValueChange={(value) =>
                                  updateAdditionQuestionMaxSelect(
                                    section.id,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger className="w-16 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addAdditionQuestion("open")}
                  className="rounded-full border border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Text Answer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addAdditionQuestion("radio")}
                  className="rounded-full border border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Radio
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addAdditionQuestion("checkbox")}
                  className="rounded-full border border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Checkbox
                </Button>
              </div>
            </div>
          </section>

          {/* ===== Addition File ===== */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold gradient-text inline-block">
              Addition File
            </h2>

            <div className="space-y-3">
              {additionFiles.map((section, index) => (
                <div key={section.id} className="rounded-lg border p-4 w-3/5">
                  <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>File requirement {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAdditionFile(section.id)}
                      className="hover:text-foreground inline-flex items-center gap-1"
                      aria-label="Delete"
                    >
                      <img src={IoTrashBin} alt="Delete" className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm dark:text-accent">Label</label>
                      <Input
                        value={section.label}
                        onChange={(event) =>
                          updateAdditionFile(
                            section.id,
                            "label",
                            event.target.value,
                          )
                        }
                        placeholder="Text here"
                      />
                    </div>
                    <div>
                      <label className="text-sm dark:text-accent">
                        File Type
                      </label>
                      <Select
                        value={section.fileType}
                        onValueChange={(value) =>
                          updateAdditionFile(section.id, "fileType", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="txt">txt</SelectItem>
                          <SelectItem value="jpeg">jpeg</SelectItem>
                          <SelectItem value="png">png</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-sm dark:text-accent">
                      Description
                    </label>
                    <Input
                      value={section.description}
                      onChange={(event) =>
                        updateAdditionFile(
                          section.id,
                          "description",
                          event.target.value,
                        )
                      }
                      placeholder="Type your message here"
                    />
                  </div>
                </div>
              ))}

              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addAdditionFile}
                  className="rounded-full border border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  File
                </Button>
              </div>
            </div>
          </section>

          {/* Create/Save Job Button */}
          <div className="flex justify-end mt-10 mb-10">
            <Button
              onClick={createdJobId ? handleSaveJob : handleCreateJob}
              disabled={isLoading}
              style={{ backgroundImage: "var(--gradient-primary)" }}
              className="px-8 py-2 text-white rounded-2xl font-normal hover:opacity-90 transition-opacity"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading
                ? createdJobId
                  ? "Saving..."
                  : "Creating..."
                : createdJobId
                  ? "Save Changes"
                  : "Create Job"}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
