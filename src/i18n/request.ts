import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

  let common, student, teacher, admin;
  if (locale === 'en') {
    [common, student, teacher, admin] = await Promise.all([
      import('../messages/en/common.json'),
      import('../messages/en/student.json'),
      import('../messages/en/teacher.json'),
      import('../messages/en/admin.json'),
    ]);
  } else {
    [common, student, teacher, admin] = await Promise.all([
      import('../messages/fr/common.json'),
      import('../messages/fr/student.json'),
      import('../messages/fr/teacher.json'),
      import('../messages/fr/admin.json'),
    ]);
  }

  return {
    locale,
    messages: {
      ...common.default,
      ...student.default,
      ...teacher.default,
      ...admin.default,
    },
  };
});
