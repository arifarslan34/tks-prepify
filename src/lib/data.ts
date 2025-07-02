import type { Category, Paper, Question } from '@/types';
import { Atom, Calculator, Briefcase, Languages } from 'lucide-react';

// Recursive function to find a category by its ID
function findCategory(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const found = findCategory(category.subcategories, id);
      if (found) return found;
    }
  }
  return undefined;
}

// Helper to get a category by ID from the main categories export
export function getCategoryById(id: string): Category | undefined {
  return findCategory(categories, id);
}

// Helper to get all descendant category IDs including the parent
export function getDescendantCategoryIds(startId: string): string[] {
  const ids: string[] = [];
  const startCategory = findCategory(categories, startId);
  if (!startCategory) return [];

  const queue: Category[] = [startCategory];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ids.push(current.id);
    if (current.subcategories) {
      queue.push(...current.subcategories);
    }
  }
  return ids;
}

// Helper to get a flattened list of categories for UI elements like select dropdowns
export function getFlattenedCategories(cats: Category[] = categories): { id: string; name: string }[] {
  const flat: { id: string; name: string }[] = [];
  function recurse(categories: Category[], level: number) {
    for (const category of categories) {
      const { subcategories, ...rest } = category;
      flat.push({ ...rest, name: `${'  '.repeat(level * 2)}${rest.name}` });
      if (subcategories) {
        recurse(subcategories, level + 1);
      }
    }
  }
  recurse(cats, 0);
  return flat;
}

// Helper to get the path (breadcrumbs) for a given category ID
export function getCategoryPath(id: string): Category[] | null {
  function findPath(cats: Category[], id: string, path: Category[]): Category[] | null {
    for (const category of cats) {
      const newPath = [...path, { ...category, subcategories: undefined }];
      if (category.id === id) return newPath;
      if (category.subcategories) {
        const found = findPath(category.subcategories, id, newPath);
        if (found) return found;
      }
    }
    return null;
  }
  return findPath(categories, id, []);
}


export const categories: Category[] = [
  { 
    id: 'cat1', name: 'Science', description: 'Explore the wonders of science.', icon: Atom,
    subcategories: [
      { id: 'cat1_1', name: 'Physics' },
      { id: 'cat1_2', name: 'Chemistry' },
    ]
  },
  { 
    id: 'cat2', name: 'Mathematics', description: 'Challenge your numerical skills.', icon: Calculator,
    subcategories: [
      { id: 'cat2_1', name: 'Algebra' },
      { id: 'cat2_2', name: 'Calculus' },
    ]
  },
  { id: 'cat3', name: 'Business Studies', description: 'Learn the fundamentals of business.', icon: Briefcase,
    subcategories: [
      { id: 'cat3_1', name: 'Marketing' }
    ]
  },
  { id: 'cat4', name: 'Language Arts', description: 'Master the art of communication.', icon: Languages,
    subcategories: [
      { id: 'cat4_1', name: 'English' }
    ]
  },
];

export const papers: Paper[] = [
  { id: 'paper1', title: 'Physics Fundamentals', description: 'Test your knowledge on basic physics principles.', categoryId: 'cat1_1', questionCount: 5, duration: 10 },
  { id: 'paper2', title: 'Algebra I', description: 'A test on introductory algebra concepts.', categoryId: 'cat2_1', questionCount: 5, duration: 15 },
  { id: 'paper3', title: 'Marketing Basics', description: 'Covering the core concepts of marketing.', categoryId: 'cat3_1', questionCount: 5, duration: 10 },
  { id: 'paper4', title: 'Grammar and Punctuation', description: 'Evaluate your command of English grammar.', categoryId: 'cat4_1', questionCount: 5, duration: 5 },
  { id: 'paper5', title: 'Chemistry Basics', description: 'A primer on chemical reactions and the periodic table.', categoryId: 'cat1_2', questionCount: 5, duration: 10 },
  { id: 'paper6', title: 'Calculus I', description: 'Introduction to derivatives and integrals.', categoryId: 'cat2_2', questionCount: 5, duration: 20 },
];

export const questions: Question[] = [
  // Physics Fundamentals (paper1)
  { id: 'q1', paperId: 'paper1', questionText: 'What is the SI unit of force?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correctAnswer: 'Newton', explanation: 'The SI unit of force is the Newton (N), named after Sir Isaac Newton.' },
  { id: 'q2', paperId: 'paper1', questionText: 'What is the formula for calculating speed?', options: ['Distance / Time', 'Time / Distance', 'Distance * Time', 'Force / Mass'], correctAnswer: 'Distance / Time', explanation: 'Speed is a scalar quantity that refers to "how fast an object is moving."' },
  { id: 'q3', paperId: 'paper1', questionText: 'Which law of motion is also known as the law of inertia?', options: ['First Law', 'Second Law', 'Third Law', 'Zeroth Law'], correctAnswer: 'First Law', explanation: "Newton's First Law of Motion states that an object will remain at rest or in uniform motion unless acted upon by an external force." },
  { id: 'q4', paperId: 'paper1', questionText: 'What type of energy is stored in a battery?', options: ['Kinetic', 'Potential', 'Chemical', 'Mechanical'], correctAnswer: 'Chemical', explanation: 'Batteries store chemical energy, which is converted into electrical energy when the battery is used.' },
  { id: 'q5', paperId: 'paper1', questionText: 'What is the acceleration due to gravity on Earth (approx.)?', options: ['9.8 m/s²', '5.5 m/s²', '12.1 m/s²', '1.6 m/s²'], correctAnswer: '9.8 m/s²', explanation: 'The standard value for acceleration due to gravity on the surface of the Earth is approximately 9.8 m/s².' },
  
  // Algebra I (paper2)
  { id: 'q6', paperId: 'paper2', questionText: 'Solve for x: 2x + 3 = 11', options: ['3', '4', '5', '6'], correctAnswer: '4', explanation: 'Subtract 3 from both sides to get 2x = 8, then divide by 2 to get x = 4.' },
  { id: 'q7', paperId: 'paper2', questionText: 'What is the value of x^2 + 2x + 1 when x = 3?', options: ['12', '14', '16', '18'], correctAnswer: '16', explanation: '(3)^2 + 2(3) + 1 = 9 + 6 + 1 = 16.' },
  { id: 'q8', paperId: 'paper2', questionText: 'Factor the expression: x^2 - 9', options: ['(x-3)(x-3)', '(x+3)(x-3)', '(x+3)(x+3)', '(x-9)(x+1)'], correctAnswer: '(x+3)(x-3)', explanation: 'This is a difference of squares, a^2 - b^2 = (a+b)(a-b).' },
  { id: 'q9', paperId: 'paper2', questionText: 'What is the slope of the line y = 3x - 2?', options: ['3', '-2', '1', '2'], correctAnswer: '3', explanation: 'In the slope-intercept form y = mx + b, m represents the slope.' },
  { id: 'q10', paperId: 'paper2', questionText: 'Simplify: (x^3)^2', options: ['x^5', 'x^6', 'x^9', '2x^3'], correctAnswer: 'x^6', explanation: 'When raising a power to a power, you multiply the exponents: (x^a)^b = x^(a*b).' },
  
  // Marketing Basics (paper3)
  { id: 'q11', paperId: 'paper3', questionText: 'What are the 4 Ps of marketing?', options: ['Product, Price, Place, Promotion', 'People, Price, Place, Promotion', 'Product, Profit, Place, Promotion', 'Product, Price, People, Promotion'], correctAnswer: 'Product, Price, Place, Promotion', explanation: 'The 4 Ps are the foundation of the marketing mix.' },
  { id: 'q12', paperId: 'paper3', questionText: 'What does SWOT stand for?', options: ['Strengths, Weaknesses, Opportunities, Threats', 'Sales, Work, Opportunities, Threats', 'Strengths, Work, Opportunities, Time', 'Strategy, Weaknesses, Objectives, Threats'], correctAnswer: 'Strengths, Weaknesses, Opportunities, Threats', explanation: 'SWOT analysis is a strategic planning technique.' },
  { id: 'q13', paperId: 'paper3', questionText: 'Which of these is a form of digital marketing?', options: ['Billboards', 'Newspaper ads', 'Social Media Marketing', 'Radio commercials'], correctAnswer: 'Social Media Marketing', explanation: 'Social Media Marketing uses online platforms to build a brand and promote products.' },
  { id: 'q14', paperId: 'paper3', questionText: 'What is a target audience?', options: ['Everyone who buys a product', 'A specific group of consumers a company aims to reach', 'The employees of a company', 'Competitors'], correctAnswer: 'A specific group of consumers a company aims to reach', explanation: 'Defining a target audience is crucial for effective marketing campaigns.' },
  { id: 'q15', paperId: 'paper3', questionText: 'What is a brand?', options: ["A company's logo", 'A product', 'A perception of a company in the eyes of the consumer', 'A marketing campaign'], correctAnswer: 'A perception of a company in the eyes of the consumer', explanation: 'A brand is more than just a logo; it encompasses the entire customer experience and perception.' },

  // Grammar and Punctuation (paper4)
  { id: 'q16', paperId: 'paper4', questionText: "Which sentence uses 'its' and 'it's' correctly?", options: ["It's a beautiful day, and the dog wagged its tail.", "Its a beautiful day, and the dog wagged it's tail.", "It's a beautiful day, and the dog wagged it's tail.", "Its a beautiful day, and the dog wagged its tail."], correctAnswer: "It's a beautiful day, and the dog wagged its tail.", explanation: "'It's' is a contraction for 'it is'. 'Its' is possessive." },
  { id: 'q17', paperId: 'paper4', questionText: 'Choose the correct form of the verb: The team ____ working hard.', options: ['is', 'are', 'be', 'was'], correctAnswer: 'is', explanation: "'Team' is a collective noun and is treated as a singular entity in this context." },
  { id: 'q18', paperId: 'paper4', questionText: "What is a comma splice?", options: ['Joining two independent clauses with only a comma', 'A type of cheese', 'Forgetting a comma', 'Using too many commas'], correctAnswer: 'Joining two independent clauses with only a comma', explanation: 'A comma splice is a common grammatical error. You should use a period, semicolon, or a coordinating conjunction with a comma.' },
  { id: 'q19', paperId: 'paper4', questionText: "Which punctuation mark is used to introduce a list?", options: ['Semicolon', 'Colon', 'Hyphen', 'Apostrophe'], correctAnswer: 'Colon', explanation: 'A colon is often used to introduce a list, an explanation, or a quotation.' },
  { id: 'q20', paperId: 'paper4', questionText: 'Identify the adverb in the sentence: "She quickly ran to the store."', options: ['She', 'quickly', 'ran', 'store'], correctAnswer: 'quickly', explanation: 'An adverb modifies a verb. "Quickly" describes how she ran.' },

  // Chemistry Basics (paper5)
  { id: 'q21', paperId: 'paper5', questionText: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Go', 'Gd'], correctAnswer: 'Au', explanation: 'The symbol for Gold is Au, from its Latin name, aurum.' },
  { id: 'q22', paperId: 'paper5', questionText: 'What is the pH of a neutral solution?', options: ['0', '7', '14', '1'], correctAnswer: '7', explanation: 'A pH of 7 is neutral. Below 7 is acidic, and above 7 is alkaline (basic).' },
  { id: 'q23', paperId: 'paper5', questionText: "Which element is most abundant in the Earth's crust?", options: ['Iron', 'Silicon', 'Oxygen', 'Aluminum'], correctAnswer: 'Oxygen', explanation: 'Oxygen is the most abundant element by mass in the Earth\'s crust.' },
  { id: 'q24', paperId: 'paper5', questionText: 'What is H2O more commonly known as?', options: ['Hydrogen Peroxide', 'Salt', 'Sugar', 'Water'], correctAnswer: 'Water', explanation: 'H2O is the chemical formula for water, with two hydrogen atoms and one oxygen atom.' },
  { id: 'q25', paperId: 'paper5', questionText: 'What is a substance that speeds up a chemical reaction without being consumed?', options: ['Catalyst', 'Inhibitor', 'Reactant', 'Product'], correctAnswer: 'Catalyst', explanation: 'A catalyst increases the rate of a chemical reaction by lowering the activation energy.' },
  
  // Calculus I (paper6)
  { id: 'q26', paperId: 'paper6', questionText: 'What is the derivative of x^2?', options: ['2x', 'x', 'x^2/2', '2'], correctAnswer: '2x', explanation: 'Using the power rule, the derivative of x^n is n*x^(n-1).' },
  { id: 'q27', paperId: 'paper6', questionText: 'What does the integral of a function represent?', options: ['The slope of the tangent line', 'The rate of change', 'The area under the curve', 'The maximum value'], correctAnswer: 'The area under the curve', explanation: 'A definite integral of a function gives the area between the function\'s curve and the x-axis.' },
  { id: 'q28', paperId: 'paper6', questionText: 'What is the derivative of sin(x)?', options: ['cos(x)', '-sin(x)', '-cos(x)', 'tan(x)'], correctAnswer: 'cos(x)', explanation: 'The derivative of sin(x) with respect to x is cos(x).' },
  { id: 'q29', paperId: 'paper6', questionText: 'What is the value of the limit of (x^2 - 1)/(x - 1) as x approaches 1?', options: ['0', '1', '2', 'Does not exist'], correctAnswer: '2', explanation: 'Factor the numerator to (x-1)(x+1) and cancel the (x-1) term. Then substitute x=1 into (x+1) to get 2.' },
  { id: 'q30', paperId: 'paper6', questionText: 'What rule is used to find the derivative of a product of two functions?', options: ['Chain Rule', 'Quotient Rule', 'Product Rule', 'Power Rule'], correctAnswer: 'Product Rule', explanation: 'The product rule is d/dx(uv) = u(dv/dx) + v(du/dx).' },
];
