import { TCourseDTO, TLessonDTO } from '@/lib/constants';
import { useState } from 'react';
import { history } from 'umi';

export default function ({
  course,
  lesson,
}: {
  course: TCourseDTO;
  lesson: TLessonDTO;
}) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div className="course-lesson">
      <button
        className="lesson-status"
        onMouseLeave={() => setIsHovered(false)}
        onMouseEnter={() => setIsHovered(true)}
        onClick={() => {}}
      >
        {isHovered ? (
          course.locked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clip-rule="evenodd"
              ></path>
            </svg>
          )
        ) : (
          <span>{lesson.number}</span>
        )}
      </button>
      <div className={`lesson-info ${course.locked && 'blur-sm'}`}>
        <h3
          className="lesson-title"
          onClick={() => {
            if (course.locked) {
              return;
            }
            history.push(`/course/${course.number}-${lesson.number}`);
          }}
        >
          <span>{lesson.title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.25 3.75H19.5a.75.75 0 01.75.75v11.25a.75.75 0 01-1.5 0V6.31L5.03 20.03a.75.75 0 01-1.06-1.06L17.69 5.25H8.25a.75.75 0 010-1.5z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </h3>
        {/* <p className="lesson-meta"></p> */}
      </div>
    </div>
  );
}
