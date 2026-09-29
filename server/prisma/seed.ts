import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SKILLS = [
  { name: 'JavaScript', category: 'Programming' },
  { name: 'TypeScript', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'Java', category: 'Programming' },
  { name: 'React', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'SQL', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'Git', category: 'Tools' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'Data Analysis', category: 'Data' },
  { name: 'Communication', category: 'Soft Skills' },
  { name: 'Problem Solving', category: 'Soft Skills' },
  { name: 'Linux', category: 'Systems' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'REST APIs', category: 'Backend' },
  { name: 'Cybersecurity', category: 'Security' },
  { name: 'Networking', category: 'Infrastructure' },
  { name: 'Excel', category: 'Tools' },
  { name: 'Data Visualization', category: 'Data' },
  { name: 'C++', category: 'Programming' },
  { name: 'PHP', category: 'Programming' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'DevOps', category: 'DevOps' },
];

const COURSES = [
  {
    name: 'Full Stack Web Development',
    description: 'Master modern web development with React, Node.js, Express and PostgreSQL. Build real-world projects from scratch.',
    duration: '12 weeks',
    level: 'Intermediate',
    availableSeats: 60,
    instructor: 'Prof. Rajesh Kumar',
    skills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'SQL', 'HTML', 'CSS'],
  },
  {
    name: 'Data Analytics',
    description: 'Learn data analysis, visualization, and business intelligence using Python, SQL and modern BI tools.',
    duration: '10 weeks',
    level: 'Beginner',
    availableSeats: 45,
    instructor: 'Dr. Priya Sharma',
    skills: ['Python', 'SQL', 'Data Analysis', 'Data Visualization', 'Excel'],
  },
  {
    name: 'Artificial Intelligence',
    description: 'Deep dive into machine learning, deep learning, NLP and computer vision with hands-on Python projects.',
    duration: '14 weeks',
    level: 'Advanced',
    availableSeats: 30,
    instructor: 'Dr. Amit Patel',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
  },
  {
    name: 'Cyber Security',
    description: 'Comprehensive cybersecurity training covering ethical hacking, network security, and incident response.',
    duration: '10 weeks',
    level: 'Intermediate',
    availableSeats: 35,
    instructor: 'Mr. Suresh Nair',
    skills: ['Networking', 'Linux', 'Cybersecurity'],
  },
  {
    name: 'Cloud Computing',
    description: 'Master AWS, Azure and GCP. Learn infrastructure automation, containers, and DevOps practices.',
    duration: '8 weeks',
    level: 'Intermediate',
    availableSeats: 40,
    instructor: 'Ms. Anita Desai',
    skills: ['AWS', 'Linux', 'Docker', 'DevOps'],
  },
  {
    name: 'Digital Marketing',
    description: 'Learn SEO, social media marketing, Google Ads, email marketing and analytics for business growth.',
    duration: '6 weeks',
    level: 'Beginner',
    availableSeats: 80,
    instructor: 'Ms. Meera Joshi',
    skills: ['Communication', 'Data Analysis', 'Excel'],
  },
  {
    name: 'Mobile App Development',
    description: 'Build iOS and Android apps using React Native and Flutter with deployment on app stores.',
    duration: '10 weeks',
    level: 'Intermediate',
    availableSeats: 40,
    instructor: 'Mr. Vikram Singh',
    skills: ['JavaScript', 'React'],
  },
  {
    name: 'DevOps & CI/CD',
    description: 'Master Jenkins, Docker, Kubernetes, and automated deployment pipelines for modern software delivery.',
    duration: '8 weeks',
    level: 'Advanced',
    availableSeats: 25,
    instructor: 'Mr. Arun Mehta',
    skills: ['Docker', 'Linux', 'Git', 'DevOps'],
  },
];

const APPLICANTS = [
  { fullName: 'Arjun Sharma', email: 'arjun.sharma@demo.com', gender: 'Male', location: 'Mumbai', skills: ['JavaScript', 'HTML', 'CSS', 'React'], qual: 'B.Tech CSE', inst: 'Mumbai University', course: 'Computer Science' },
  { fullName: 'Priya Patel', email: 'priya.patel@demo.com', gender: 'Female', location: 'Pune', skills: ['Python', 'SQL', 'Data Analysis', 'Excel'], qual: 'BCA', inst: 'Pune University', course: 'Computer Applications' },
  { fullName: 'Rahul Desai', email: 'rahul.desai@demo.com', gender: 'Male', location: 'Nagpur', skills: ['Java', 'SQL', 'Problem Solving'], qual: 'B.Tech IT', inst: 'Nagpur Institute', course: 'Information Technology' },
  { fullName: 'Sneha Joshi', email: 'sneha.joshi@demo.com', gender: 'Female', location: 'Nashik', skills: ['HTML', 'CSS', 'JavaScript', 'Communication'], qual: 'BCS', inst: 'Nashik College', course: 'Computer Science' },
  { fullName: 'Amit Kulkarni', email: 'amit.kulkarni@demo.com', gender: 'Male', location: 'Aurangabad', skills: ['Python', 'Machine Learning', 'Data Analysis'], qual: 'M.Tech AI', inst: 'VNIT', course: 'Artificial Intelligence' },
  { fullName: 'Divya Nair', email: 'divya.nair@demo.com', gender: 'Female', location: 'Thane', skills: ['Java', 'MySQL', 'Problem Solving', 'Git'], qual: 'B.Tech CSE', inst: 'Thane University', course: 'Software Engineering' },
  { fullName: 'Rohan Mehta', email: 'rohan.mehta@demo.com', gender: 'Male', location: 'Kolhapur', skills: ['JavaScript', 'React', 'Node.js', 'SQL'], qual: 'B.Tech', inst: 'Kolhapur Institute', course: 'Web Development' },
  { fullName: 'Anjali Singh', email: 'anjali.singh@demo.com', gender: 'Female', location: 'Solapur', skills: ['Excel', 'Data Analysis', 'Communication'], qual: 'BBA', inst: 'Solapur University', course: 'Business Administration' },
  { fullName: 'Vikram Rao', email: 'vikram.rao@demo.com', gender: 'Male', location: 'Mumbai', skills: ['Python', 'SQL', 'Machine Learning', 'Linux'], qual: 'MCA', inst: 'Mumbai University', course: 'Computer Applications' },
  { fullName: 'Pooja Iyer', email: 'pooja.iyer@demo.com', gender: 'Female', location: 'Pune', skills: ['JavaScript', 'HTML', 'CSS', 'Vue.js'], qual: 'B.Tech CSE', inst: 'PICT Pune', course: 'Computer Science' },
  { fullName: 'Suresh Patil', email: 'suresh.patil@demo.com', gender: 'Male', location: 'Nagpur', skills: ['Java', 'C++', 'Problem Solving', 'Git'], qual: 'B.Tech CSE', inst: 'GCOE Nagpur', course: 'Computer Engineering' },
  { fullName: 'Kavita Wagh', email: 'kavita.wagh@demo.com', gender: 'Female', location: 'Amravati', skills: ['HTML', 'CSS', 'Communication'], qual: 'BCA', inst: 'Amravati University', course: 'Computer Applications' },
  { fullName: 'Nilesh Chavan', email: 'nilesh.chavan@demo.com', gender: 'Male', location: 'Nashik', skills: ['AWS', 'Linux', 'Docker', 'DevOps'], qual: 'B.Tech IT', inst: 'Nashik Institute', course: 'Cloud & DevOps' },
  { fullName: 'Rekha Bhosale', email: 'rekha.bhosale@demo.com', gender: 'Female', location: 'Satara', skills: ['Python', 'Data Analysis', 'Excel', 'SQL'], qual: 'B.Sc Statistics', inst: 'Satara College', course: 'Statistics' },
  { fullName: 'Ganesh Shinde', email: 'ganesh.shinde@demo.com', gender: 'Male', location: 'Sangli', skills: ['Java', 'SQL', 'REST APIs'], qual: 'B.Tech CSE', inst: 'DKTE Ichalkaranji', course: 'Computer Science' },
  { fullName: 'Madhuri Pawar', email: 'madhuri.pawar@demo.com', gender: 'Female', location: 'Jalgaon', skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'], qual: 'MCA', inst: 'NMU Jalgaon', course: 'Computer Applications' },
  { fullName: 'Tushar Kale', email: 'tushar.kale@demo.com', gender: 'Male', location: 'Dhule', skills: ['PHP', 'SQL', 'HTML', 'CSS'], qual: 'BCS', inst: 'Dhule College', course: 'Computer Science' },
  { fullName: 'Sunita Mane', email: 'sunita.mane@demo.com', gender: 'Female', location: 'Latur', skills: ['Python', 'Communication', 'Excel'], qual: 'B.Sc CS', inst: 'Latur University', course: 'Computer Science' },
  { fullName: 'Ashok Jadhav', email: 'ashok.jadhav@demo.com', gender: 'Male', location: 'Osmanabad', skills: ['Networking', 'Linux', 'Cybersecurity'], qual: 'B.Tech ECE', inst: 'SRTMU', course: 'Electronics' },
  { fullName: 'Prerna Kulkarni', email: 'prerna.kulkarni@demo.com', gender: 'Female', location: 'Ratnagiri', skills: ['JavaScript', 'Node.js', 'MongoDB', 'REST APIs'], qual: 'B.Tech CSE', inst: 'MIT Ratnagiri', course: 'Software Development' },
];

const OFFICIALS = [
  { fullName: 'Rajendra Patil', email: 'official@demo.com', officialId: 'GOV1001', designation: 'Senior Official', department: 'Digital Services', govId: 'GOV-XXXX-1001' },
  { fullName: 'Sunanda Chavan', email: 'sunanda.chavan@demo.com', officialId: 'GOV1002', designation: 'Verification Officer', department: 'Applicant Verification', govId: 'GOV-XXXX-1002' },
  { fullName: 'Kiran More', email: 'kiran.more@demo.com', officialId: 'GOV1003', designation: 'Course Manager', department: 'Training & Development', govId: 'GOV-XXXX-1003' },
  { fullName: 'Leela Deshpande', email: 'leela.deshpande@demo.com', officialId: 'GOV1004', designation: 'Data Analyst', department: 'Analytics', govId: 'GOV-XXXX-1004' },
  { fullName: 'Prakash Sawant', email: 'prakash.sawant@demo.com', officialId: 'GOV1005', designation: 'IT Administrator', department: 'IT Department', govId: 'GOV-XXXX-1005' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up
  await prisma.recommendation.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.skillGap.deleteMany();
  await prisma.gapAnalysis.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseSkill.deleteMany();
  await prisma.course.deleteMany();
  await prisma.applicantSkill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.tracker.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.applicantProfile.deleteMany();
  await prisma.governmentOfficial.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create skills
  const skillMap = new Map<string, string>();
  for (const skill of SKILLS) {
    const created = await prisma.skill.create({ data: skill });
    skillMap.set(created.name, created.id);
  }
  console.log(`✅ Created ${SKILLS.length} skills`);

  // Create courses with skills
  for (const course of COURSES) {
    const { skills, ...courseData } = course;
    const createdCourse = await prisma.course.create({ data: { ...courseData, enrolledCount: 0 } });
    for (const skillName of skills) {
      const skillId = skillMap.get(skillName);
      if (skillId) {
        await prisma.courseSkill.create({ data: { courseId: createdCourse.id, skillId } });
      }
    }
  }
  console.log(`✅ Created ${COURSES.length} courses`);

  // Create admin
  const adminHash = await bcrypt.hash('Admin@123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user');

  // Demo applicant (easy login)
  const demoHash = await bcrypt.hash('Applicant@123', 12);
  const demoUser = await prisma.user.create({
    data: {
      email: 'applicant@demo.com',
      passwordHash: demoHash,
      role: 'APPLICANT',
      applicantProfile: {
        create: {
          applicantId: 'APP1001',
          fullName: 'Demo Applicant',
          gender: 'Male',
          mobile: '9876543210',
          alternateMobile: '9876543211',
          location: 'Mumbai, Maharashtra',
          currentAddress: 'Flat 204, Shivaji Nagar, Mumbai - 400001',
          permanentAddress: 'Village Ratnagiri, Dist. Ratnagiri, Maharashtra',
          maskedAadhaar: 'XXXX-XXXX-1234',
          verificationStatus: 'VERIFIED',
          biometricVerified: true,
          profileCompletion: 92,
          dob: new Date('1999-05-15'),
          education: {
            create: {
              qualification: 'B.Tech CSE',
              institution: 'Mumbai Institute of Technology',
              course: 'Computer Science Engineering',
              specialization: 'Software Development',
              graduationYear: 2023,
            },
          },
        },
      },
      notifications: {
        create: [
          { title: 'Welcome to MH Gov Portal!', message: 'Your profile is set up and ready. Explore AI Gap Analyzer!', type: 'SUCCESS' },
          { title: 'Profile 92% Complete', message: 'Add your remaining details to complete your profile.', type: 'INFO' },
        ],
      },
    },
    include: { applicantProfile: true },
  });

  // Add skills to demo user
  const demoSkillNames = ['JavaScript', 'HTML', 'CSS', 'SQL', 'Java', 'Python'];
  for (const skillName of demoSkillNames) {
    const skillId = skillMap.get(skillName);
    if (skillId && demoUser.applicantProfile) {
      await prisma.applicantSkill.create({
        data: {
          applicantId: demoUser.applicantProfile.id,
          skillId,
          level: skillName === 'JavaScript' || skillName === 'HTML' ? 'INTERMEDIATE' : 'BEGINNER',
        },
      });
    }
  }

  // Add verifications for demo user
  if (demoUser.applicantProfile) {
    await prisma.verification.createMany({
      data: [
        { applicantId: demoUser.applicantProfile.id, type: 'IDENTITY', status: 'VERIFIED', verifiedAt: new Date() },
        { applicantId: demoUser.applicantProfile.id, type: 'BIOMETRIC', status: 'VERIFIED', verifiedAt: new Date() },
        { applicantId: demoUser.applicantProfile.id, type: 'COURSE', status: 'PENDING' },
      ],
    });

    // Add application
    await prisma.application.create({
      data: {
        applicantId: demoUser.applicantProfile.id,
        applicationType: 'COURSE_ENROLLMENT',
        program: 'Full Stack Web Development',
        status: 'UNDER_REVIEW',
        statusHistory: {
          create: [
            { status: 'SUBMITTED', remarks: 'Application submitted successfully', updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { status: 'DOCUMENTS_VERIFIED', remarks: 'Documents verified', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { status: 'ELIGIBILITY_CHECKED', remarks: 'Eligibility criteria met', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { status: 'UNDER_REVIEW', remarks: 'Under final review', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          ],
        },
      },
    });

    // Enroll in a course
    const fsDevCourse = await prisma.course.findFirst({ where: { name: 'Full Stack Web Development' } });
    if (fsDevCourse) {
      await prisma.enrollment.create({
        data: {
          applicantId: demoUser.applicantProfile.id,
          courseId: fsDevCourse.id,
          status: 'IN_PROGRESS',
          progress: 35,
        },
      });
      await prisma.course.update({ where: { id: fsDevCourse.id }, data: { enrolledCount: { increment: 1 } } });
    }

    // Add tracker
    await prisma.tracker.create({
      data: {
        applicantId: demoUser.applicantProfile.id,
        designation: 'Junior Software Developer (Trainee)',
        governmentId: 'GOV-APP-1001',
        epfoStatus: 'VERIFIED',
        taxGstStatus: 'VERIFIED',
        credentialStatus: 'Active',
        notes: 'Demo applicant — verified and enrolled.',
      },
    });
  }

  console.log('✅ Created demo applicant');

  // Create government officials
  const officialHash = await bcrypt.hash('Official@123', 12);
  for (const official of OFFICIALS) {
    await prisma.user.create({
      data: {
        email: official.email,
        passwordHash: officialHash,
        role: 'GOVERNMENT_OFFICIAL',
        governmentOfficial: {
          create: {
            officialId: official.officialId,
            fullName: official.fullName,
            designation: official.designation,
            department: official.department,
            governmentId: official.govId,
            epfoStatus: 'VERIFIED',
            taxGstStatus: 'VERIFIED',
            mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          },
        },
      },
    });
  }
  console.log(`✅ Created ${OFFICIALS.length} government officials`);

  // Create regular applicants with data
  const appHash = await bcrypt.hash('Demo@123', 12);
  const appStatuses = ['SUBMITTED', 'DOCUMENTS_VERIFIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ELIGIBILITY_CHECKED'] as const;
  const verStatuses = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
  const courseNames = COURSES.map(c => c.name);
  const allCourses = await prisma.course.findMany();

  for (let i = 0; i < APPLICANTS.length; i++) {
    const applicant = APPLICANTS[i];
    const appStatus = appStatuses[i % appStatuses.length];
    const verStatus = verStatuses[i % verStatuses.length];
    const daysAgo = (i + 1) * 3;

    const user = await prisma.user.create({
      data: {
        email: applicant.email,
        passwordHash: appHash,
        role: 'APPLICANT',
        applicantProfile: {
          create: {
            applicantId: `APP${2000 + i}`,
            fullName: applicant.fullName,
            gender: applicant.gender,
            location: applicant.location,
            currentAddress: `${100 + i} Demo Street, ${applicant.location}`,
            permanentAddress: `Village ${applicant.location}, Maharashtra`,
            maskedAadhaar: `XXXX-XXXX-${String(1000 + i).padStart(4, '0')}`,
            verificationStatus: verStatus,
            biometricVerified: verStatus === 'VERIFIED',
            profileCompletion: 50 + Math.floor(Math.random() * 45),
            mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
            dob: new Date(1998 + (i % 5), i % 12, (i % 28) + 1),
            education: {
              create: {
                qualification: applicant.qual,
                institution: applicant.inst,
                course: applicant.course,
                graduationYear: 2020 + (i % 5),
              },
            },
          },
        },
      },
      include: { applicantProfile: true },
    });

    if (user.applicantProfile) {
      // Add skills
      for (const skillName of applicant.skills) {
        const skillId = skillMap.get(skillName);
        if (skillId) {
          await prisma.applicantSkill.create({
            data: {
              applicantId: user.applicantProfile.id,
              skillId,
              level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][i % 3] as any,
            },
          }).catch(() => {});
        }
      }

      // Add application
      await prisma.application.create({
        data: {
          applicantId: user.applicantProfile.id,
          applicationType: 'COURSE_ENROLLMENT',
          program: courseNames[i % courseNames.length],
          status: appStatus,
          submittedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          statusHistory: {
            create: [
              {
                status: 'SUBMITTED',
                remarks: 'Application submitted',
                updatedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
              },
            ],
          },
        },
      });

      // Enroll some in courses
      if (i % 2 === 0) {
        const course = allCourses[i % allCourses.length];
        await prisma.enrollment.create({
          data: {
            applicantId: user.applicantProfile.id,
            courseId: course.id,
            status: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED'][i % 3] as any,
            progress: Math.floor(Math.random() * 100),
          },
        });
        await prisma.course.update({ where: { id: course.id }, data: { enrolledCount: { increment: 1 } } });
      }

      // Add verifications
      await prisma.verification.createMany({
        data: [
          { applicantId: user.applicantProfile.id, type: 'IDENTITY', status: verStatus, verifiedAt: verStatus === 'VERIFIED' ? new Date() : null },
          { applicantId: user.applicantProfile.id, type: 'BIOMETRIC', status: i % 3 === 0 ? 'VERIFIED' : 'PENDING' },
        ],
      });

      // Add tracker
      await prisma.tracker.create({
        data: {
          applicantId: user.applicantProfile.id,
          designation: ['Junior Clerk', 'Trainee', 'Intern', 'Junior Developer'][i % 4],
          governmentId: `GOV-APP-${2000 + i}`,
          epfoStatus: verStatuses[i % 3],
          taxGstStatus: verStatuses[(i + 1) % 3],
          credentialStatus: verStatus === 'VERIFIED' ? 'Active' : 'Pending',
          lastUpdated: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        },
      });

      // Add gap analysis for some
      if (i % 3 === 0) {
        await prisma.gapAnalysis.create({
          data: {
            applicantId: user.applicantProfile.id,
            targetRole: ['Full Stack Developer', 'Data Analyst', 'Software Engineer'][i % 3],
            matchPercentage: 40 + Math.floor(Math.random() * 50),
            summary: 'Demo AI analysis result.',
            isDemo: true,
            skillGaps: {
              create: [
                { skillName: 'React', currentLevel: 'BEGINNER', requiredLevel: 'INTERMEDIATE', priority: 'HIGH' },
                { skillName: 'Node.js', currentLevel: 'BEGINNER', requiredLevel: 'INTERMEDIATE', priority: 'HIGH' },
                { skillName: 'Docker', currentLevel: 'BEGINNER', requiredLevel: 'BEGINNER', priority: 'MEDIUM' },
              ],
            },
          },
        });
      }
    }
  }

  console.log(`✅ Created ${APPLICANTS.length} applicants with full data`);
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📧 Demo Credentials:');
  console.log('  Applicant:  applicant@demo.com  / Applicant@123');
  console.log('  Official:   official@demo.com   / Official@123');
  console.log('  Admin:      admin@demo.com      / Admin@123');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
