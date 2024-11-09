import Banner from '@/components/Banner';
import Lesson from '@/components/Lesson';
import { CourseMap } from '@/lib/constants';
import './index.less';

export default function HomePage() {
  return (
    <div className="course-page">
      <Banner />

      <div className="course-list max-w-4xl">
        {CourseMap.map((course) => (
          <div className="course-week">
            <div className="course-week-header">
              <span className="week-number">Week {course.number}</span>
              <h2 className="week-title">{course.title}</h2>
            </div>
            <div className="course-lesson-list">
              {course.lessons.map((lesson) => (
                <Lesson course={course} lesson={lesson} key={lesson.number} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
