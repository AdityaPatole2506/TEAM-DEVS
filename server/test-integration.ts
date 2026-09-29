/**
 * MH Gov Portal - Complete Integration Test Suite
 * Validates backend APIs, database persistence, role authentication,
 * and business workflows end-to-end.
 */

const API_BASE = 'http://localhost:5000/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data: any = await response.json();
  return { status: response.status, data };
}

async function runIntegrationTests() {
  console.log('🧪 Starting MH Gov Portal Full Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetails?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, errorDetails || '');
      failed++;
    }
  }

  try {
    // Test 1: Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.success === true, 'GET /api/health endpoint');

    // Test 2: Applicant login
    const appLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'applicant@demo.com', password: 'Applicant@123' }),
    });
    assert(appLogin.status === 200 && appLogin.data.data?.token, 'POST /api/auth/login for Applicant');
    const applicantToken = appLogin.data.data?.token;

    // Test 3: Official login
    const offLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'official@demo.com', password: 'Official@123' }),
    });
    assert(offLogin.status === 200 && offLogin.data.data?.user?.role === 'GOVERNMENT_OFFICIAL', 'POST /api/auth/login for Official');
    const officialToken = offLogin.data.data?.token;

    // Test 4: Admin login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@demo.com', password: 'Admin@123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.data?.user?.role === 'ADMIN', 'POST /api/auth/login for Admin');
    const adminToken = adminLogin.data.data?.token;

    // Test 5: Applicant Profile fetch
    const profile = await request('/applicant/profile', {
      headers: { Authorization: `Bearer ${applicantToken}` },
    });
    assert(profile.status === 200 && profile.data.data?.fullName, 'GET /api/applicant/profile');

    // Test 6: AI Gap Analyzer execution
    const aiAnalysis = await request('/ai/gap-analysis', {
      method: 'POST',
      headers: { Authorization: `Bearer ${applicantToken}` },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer',
        currentSkills: ['HTML', 'CSS', 'JavaScript'],
        education: 'B.Tech CSE',
      }),
    });
    assert(
      aiAnalysis.status === 200 &&
      typeof aiAnalysis.data.data?.matchPercentage === 'number' &&
      aiAnalysis.data.data?.skillGaps?.length > 0,
      'POST /api/ai/gap-analysis execution & scoring'
    );

    // Test 7: Course catalog fetch
    const courses = await request('/courses');
    assert(courses.status === 200 && Array.isArray(courses.data.data) && courses.data.data.length > 0, 'GET /api/courses catalog');
    const testCourseId = courses.data.data[0]?.id;

    // Test 8: Official Dashboard stats
    const offDashboard = await request('/official/dashboard', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(
      offDashboard.status === 200 &&
      offDashboard.data.data?.stats?.totalApplicants > 0,
      'GET /api/official/dashboard telemetry'
    );

    // Test 9: Official Trackers fetch
    const trackers = await request('/official/trackers', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(trackers.status === 200 && Array.isArray(trackers.data.data?.trackers), 'GET /api/official/trackers records');

    // Test 10: Official Applications fetch & Status update
    const apps = await request('/official/applications', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(apps.status === 200 && Array.isArray(apps.data.data?.applications), 'GET /api/official/applications');
    const firstApp = apps.data.data?.applications?.[0];

    if (firstApp) {
      const updateApp = await request(`/official/applications/${firstApp.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${officialToken}` },
        body: JSON.stringify({ status: 'DOCUMENTS_VERIFIED', remarks: 'Integration test automated verification' }),
      });
      assert(updateApp.status === 200 && updateApp.data.data?.status === 'DOCUMENTS_VERIFIED', 'PUT /api/official/applications/:id/status');
    }

    // Test 11: Official Verifications queue & status update
    const verifications = await request('/official/verifications', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(verifications.status === 200 && Array.isArray(verifications.data.data), 'GET /api/official/verifications queue');
    const firstVer = verifications.data.data?.[0];

    if (firstVer) {
      const updateVer = await request(`/official/verifications/${firstVer.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${officialToken}` },
        body: JSON.stringify({ status: 'VERIFIED', remarks: 'Passed compliance audit check' }),
      });
      assert(updateVer.status === 200 && updateVer.data.data?.status === 'VERIFIED', 'PUT /api/official/verifications/:id/status');
    }

    // Test 12: Admin telemetry & user directory
    const adminStats = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStats.status === 200 && adminStats.data.data?.totalUsers > 0, 'GET /api/admin/stats');

    const adminUsers = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200 && Array.isArray(adminUsers.data.data?.users), 'GET /api/admin/users');

    // Test 13: Analytics endpoints
    const skillAnalytics = await request('/analytics/skills', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(skillAnalytics.status === 200 && Array.isArray(skillAnalytics.data.data?.topSkillGaps), 'GET /api/analytics/skills');

    const gapAnalytics = await request('/analytics/gap-analysis', {
      headers: { Authorization: `Bearer ${officialToken}` },
    });
    assert(gapAnalytics.status === 200 && typeof gapAnalytics.data.data?.avgMatchPercentage === 'number', 'GET /api/analytics/gap-analysis');

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🏁 Integration Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runIntegrationTests();
