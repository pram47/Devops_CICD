import { resume_color } from "@/constants/color";
import type { ResumeCreateProps } from "@/types/resumeType";
import { formatDate } from "@/utils/formatDate";
import React from "react";
import ResumeLogo from "./ResumeLogo";

type Props = {
  resume: ResumeCreateProps;
};

const formatValue = (value?: Date | string) =>
  value ? formatDate({ date: value, format: "DD/MM/YYYY" }) : "";

const formatRange = (start?: Date | string, end?: Date | string) => {
  const startLabel = formatValue(start);
  const endLabel = formatValue(end);
  if (!startLabel && !endLabel) return "";
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel || endLabel;
};

const Template1: React.FC<Props> = ({ resume }) => {
  const data = resume.data || ({} as ResumeCreateProps["data"]);
  const accentColor =
    resume_color[resume.color ?? 0]?.value ?? resume_color[0].value;
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");

  const contacts = (data.contact || []).filter(
    (c) => (c.label || "").trim() || (c.link || "").trim(),
  );
  const skills = (data.skills || []).filter((s) => (s.name || "").trim());
  const education = (data.education || []).filter(
    (e) => e.school_name || e.degree || e.field_of_study,
  );
  const experience = (data.work_experience || []).filter(
    (e) => e.position || e.company_name,
  );
  const projects = (data.projects || []).filter((p) => p.name || p.description);
  const achievements = (data.achievement || []).filter(
    (a) => a.name || a.project_name || a.description,
  );
  const miscellaneous = (data.miscellaneous || []).filter(
    (item) => item.label || item.data,
  );

  const addressParts = [
    data.address?.address_line,
    data.address?.no && `เลขที่ ${data.address?.no}`,
    data.address?.moo && `ม. ${data.address?.moo}`,
    data.address?.soi && `ซ. ${data.address?.soi}`,
    data.address?.street && `ถนน ${data.address?.street}`,
    data.address?.sub_district,
    data.address?.district,
    data.address?.province,
    data.address?.country,
    data.address?.postal_code && `${data.address?.postal_code}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid w-[794px] min-h-[1123px] grid-cols-[260px_1fr] bg-white font-sans text-c-1f2933">
      <aside
        className="px-[22px] py-7 text-white"
        style={{ backgroundColor: accentColor }}
      >
        {data.logo && (
          <ResumeLogo
            logo={data.logo}
            size={100}
            className="mb-4 rounded-lg p-1"
          />
        )}
        <div className="text-[26px] font-semibold leading-[1.2]">
          {fullName || "Your Name"}
        </div>
        {data.phone && <div className="mt-3 text-[13px]">{data.phone}</div>}
        {data.email && <div className="mt-2 text-[13px]">{data.email}</div>}
        {addressParts && (
          <div className="mt-2 text-[12px] leading-[1.4]">{addressParts}</div>
        )}

        {contacts.length > 0 && (
          <section className="mt-5">
            <div className="text-[13px] font-semibold">Contact</div>
            <div className="mt-2 text-[12px] leading-[1.4]">
              {contacts.map((c, idx) => (
                <div key={`${c.label}-${idx}`}>
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white decoration-white/70 hover:decoration-white"
                  >
                    {c.label || c.link}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mt-5">
            <div className="text-[13px] font-semibold">Skills</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[12px]">
              {skills.map((s, idx) => (
                <span
                  key={`${s.name}-${idx}`}
                  className="rounded-md bg-white/20 px-[6px] py-[2px]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </aside>

      <main className="px-7 pb-8 pt-7">
        {education.length > 0 && (
          <section className="mb-[18px]">
            <div
              className="text-[15px] font-semibold"
              style={{ color: accentColor }}
            >
              Education
            </div>
            {education.map((e, idx) => (
              <div
                key={`${e.school_name}-${idx}`}
                className="mt-2.5 break-inside-avoid"
              >
                <div className="font-semibold">{e.school_name}</div>
                <div className="text-[12px] text-c-52606d">
                  {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                </div>
                <div className="text-[12px] text-c-52606d">
                  {formatRange(e.start_date, e.end_date)}
                </div>
              </div>
            ))}
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-[18px]">
            <div
              className="text-[15px] font-semibold"
              style={{ color: accentColor }}
            >
              Experience
            </div>
            {experience.map((e, idx) => (
              <div
                key={`${e.company_name}-${idx}`}
                className="mt-2.5 break-inside-avoid"
              >
                <div className="font-semibold">{e.position || "Role"}</div>
                <div className="text-[12px] text-c-52606d">
                  {[e.company_name].filter(Boolean).join(" · ")}
                </div>
                <div className="text-[12px] text-c-52606d">
                  {formatRange(e.start_date, e.end_Date)}
                </div>
                {(e.skills?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                    {e.skills.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-md bg-c-e4e7eb px-1.5 py-0.5 text-c-52606d"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-[18px]">
            <div
              className="text-[15px] font-semibold"
              style={{ color: accentColor }}
            >
              Projects
            </div>
            {projects.map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className="mt-2.5 break-inside-avoid"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-[12px] text-c-52606d">
                  {formatRange(p.start_date, p.end_date)}
                </div>
                {p.description && (
                  <div className="mt-1 text-[13px]">{p.description}</div>
                )}
                {(p.skills?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                    {p.skills.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-md bg-c-e4e7eb px-1.5 py-0.5 text-c-52606d"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {achievements.length > 0 && (
          <section className="mb-[18px]">
            <div
              className="text-[15px] font-semibold"
              style={{ color: accentColor }}
            >
              Achievements
            </div>
            {achievements.map((a, idx) => (
              <div
                key={`${a.name}-${idx}`}
                className="mt-2.5 break-inside-avoid"
              >
                <div className="font-semibold">{a.name || a.project_name}</div>
                <div className="text-[12px] text-c-52606d">
                  {formatValue(a.date)}
                </div>
                {a.description && (
                  <div className="mt-1 text-[13px]">{a.description}</div>
                )}
                {(a.skills?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                    {a.skills.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-md bg-c-e4e7eb px-1.5 py-0.5 text-c-52606d"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {miscellaneous.length > 0 && (
          <section>
            <div
              className="text-[15px] font-semibold"
              style={{ color: accentColor }}
            >
              Miscellaneous
            </div>
            {miscellaneous.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="mt-2.5 break-inside-avoid"
              >
                <div className="font-semibold">{item.label}</div>
                {item.data && <div className="text-[13px]">{item.data}</div>}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Template1;
