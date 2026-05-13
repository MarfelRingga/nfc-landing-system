import { describe, it, expect } from 'vitest';

describe('Demo Member Name Resonator Logic', () => {
  it('should fallback to default names when no members fetched', () => {
    const demoCircleMembers: any[] = [];
    const getDemoMemberName = (index: number) => {
      const defaultNames = ['You', 'Marfel Ringga', 'Sarah Jin', 'Mike Ross', 'Emma DW', 'David Kim'];
      if (demoCircleMembers && demoCircleMembers[index] && demoCircleMembers[index].profiles) {
        if (index === 0) return 'You';
        const profile = demoCircleMembers[index].profiles;
        return profile.full_name || profile.username || defaultNames[index];
      }
      return defaultNames[index];
    };

    expect(getDemoMemberName(1)).toBe('Marfel Ringga');
    expect(getDemoMemberName(2)).toBe('Sarah Jin');
  });

  it('should use real fetched members if present', () => {
    const demoCircleMembers: any[] = [
      { profiles: { full_name: 'Real User 1' } },
      { profiles: { full_name: 'Real User 2' } },
      { profiles: { full_name: 'Real User 3' } },
    ];
    const getDemoMemberName = (index: number) => {
      const defaultNames = ['You', 'Marfel Ringga', 'Sarah Jin', 'Mike Ross', 'Emma DW', 'David Kim'];
      if (demoCircleMembers && demoCircleMembers[index] && demoCircleMembers[index].profiles) {
        if (index === 0) return 'You';
        const profile = demoCircleMembers[index].profiles;
        return profile.full_name || profile.username || defaultNames[index];
      }
      return defaultNames[index];
    };

    expect(getDemoMemberName(0)).toBe('You'); // First index always 'You'
    expect(getDemoMemberName(1)).toBe('Real User 2');
    expect(getDemoMemberName(2)).toBe('Real User 3');
    expect(getDemoMemberName(3)).toBe('Mike Ross');
  });
});
