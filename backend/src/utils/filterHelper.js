export const getStudentFilters = (user) => {
  const query = {};
  
  // Program filter - case-insensitive regex matching
  const rawProgram = (user.program || '').trim();
  if (rawProgram) {
    const escapedProgram = rawProgram.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.program = { $regex: new RegExp(`^${escapedProgram}$`, 'i') };
  } else {
    // Default to Computer Science to avoid returning all resources
    query.program = { $regex: new RegExp(`^Computer Science$`, 'i') };
  }

  // Level filter - flexible matching (e.g. Level 1.2 or 1.2)
  const rawLevel = (user.level || '').trim();
  if (rawLevel) {
    const levelNumber = rawLevel.replace(/[^\d.]/g, '');
    if (levelNumber) {
      query.level = { $regex: new RegExp(`^(Level\\s+)?${levelNumber}$`, 'i') };
    } else {
      const escapedLevel = rawLevel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.level = { $regex: new RegExp(`^${escapedLevel}$`, 'i') };
    }
  } else {
    query.level = { $regex: new RegExp(`^(Level\\s+)?1.1$`, 'i') };
  }

  return query;
};
