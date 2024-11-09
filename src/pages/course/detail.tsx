import Banner from '@/components/Banner';
import { CourseMap, TLessonDTO } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import './detail.less';
import loadable from '@loadable/component';

const Article = loadable(async () => import('@/components/ArticleContent'));

export default function CourseLesson() {
  const params = useParams();
  const [lesson, setLesson] = useState<TLessonDTO>();
  const [md, setMd] = useState<string>('');

  useEffect(() => {
    if (!params.id) {
      history.push('/');
      return;
    }
    const [courseId, lessonId] = params.id.split('-');
    const targetCourse = CourseMap.find((c) => c.number === Number(courseId));
    if (targetCourse?.locked) {
      history.push('/');
      return;
    }
    const target = targetCourse?.lessons.find(
      (l) => l.number === Number(lessonId),
    );

    setLesson(target);

    fetch(target?.md)
      .then((res) => res.text())
      .then((text) => setMd(text));
  }, []);

  return (
    <div className="detail-page">
      <Banner lessonPage title={lesson?.title} />
      <div className="markdown-container">
        <Article markdown={md} />
      </div>
    </div>
  );
}
