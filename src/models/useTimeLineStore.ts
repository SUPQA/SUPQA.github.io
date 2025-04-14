import { InfoType, MeasureType, TemplateType } from '@/apis/type';
import { create } from 'zustand';
import * as d3 from 'd3';
import { ColorScalePalette } from '@/config';

type TimeLineStore = {
  info?: InfoType;
  colorScale?: any;
  stepData?: TemplateType[];
  measureList?: MeasureType[];

  setInfo: (payload: any) => void;
  setStepData: (payload: any) => void;
  setMeasureList: (payload: any) => void;

  updateFameList?: (payload: any) => void;
  updateTimeRange?: (payload: any) => void;
  updateSelectKeyIndex?: (payload: any) => void;
};

export const useTimeLineStore = create<TimeLineStore>((set) => ({
  info: null,
  stepData: [
    {
      title: 'Answer',
      key: 'answer',
      measure: 'answer',
      par: 'answer',
      value: 1,
      description: 'This is Description of Answer',
    },
    {
      title: 'mobility',
      key: 'mobility',
      measure: 'mobility',
      par: 'mobility',
      value: 0.8,
      description: 'This is Description of Measure Level mobility',
      children: [
        {
          title: 'Businesses & Manufacturing',
          key: 'Businesses & Manufacturing',
          category: 'Businesses & Manufacturing',
          par: 'mobility',
          description:
            'This is Description of Category Level Businesses & Manufacturing',
        },
        {
          title: 'Life Services',
          key: 'Life Services',
          category: 'Life Services',
          par: 'mobility',
          description: 'This is Description of Category Level Life Services',
        },
      ],
    },
    {
      title: 'livability',
      key: 'livability',
      measure: 'livability',
      par: 'livability',
      value: 0.6,
      description: 'This is Description of Measure Level livability',
      children: [
        {
          title: 'Government & Public Infrustructure',
          key: 'Government & Public Infrustructure',
          category: 'Government & Public Infrustructure',
          par: 'livability',
          description:
            'This is Description of Category Level Government & Public Infrustructure',
        },
        {
          title: 'Residential',
          key: 'Residential',
          par: 'livability',
          category: 'Residential',
          description: 'This is Description of Category Level Residential',
        },
      ],
    },
    {
      title: 'convenience',
      key: 'convenience',
      measure: 'convenience',
      par: 'convenience',
      value: 0.4,
      description: 'This is Description of Measure Level convenience',
      children: [
        {
          title: 'Healthcare',
          key: 'Healthcare',
          category: 'Healthcare',
          par: 'convenience',
          description: 'This is Description of Category Level Healthcare',
        },
        {
          title: 'Education',
          key: 'Education',
          category: 'Education',
          par: 'convenience',
          description: 'This is Description of Category Level Education',
        },
        {
          title: 'Sports',
          key: 'Sports',
          category: 'Sports',
          par: 'convenience',
          description: 'This is Description of Category Level Sports',
        },
      ],
    },
  ],
  measureList: [
    {
      measure: 'convenience',
      value: 1,
      corpus:
        'convenience : Convenience - (noun) the state or quality of being suitable, useful, or handy for a particular purpose or under certain conditions; a state of comfort or ease that allows for quick and easy action; a situation or feature that reduces effort, time, or difficulty in completing a task or achieving a goal.)',
      reason:
        'The user prioritizes convenient transportation for an easy commute and proximity to a school for their children, indicating a high need for convenience.',
    },
    {
      measure: 'mobility',
      value: 0.8,
      corpus:
        'mobility : Mobility: the state or quality of being able to move around freely or easily; the ability or tendency to move or be moved from place to place, or from one position to another. In the context of technology, mobility refers to the ability to access and use data, applications, and other resources from any location, using various mobile devices such as smartphones, tablets, laptops, and portable media players. In a social context, mobility can refer to the ability of individuals or groups to move up or down the social, economic, or political ladder in society.)',
      reason:
        'Easy access to transportation is crucial for the family, including consideration for an elderly member, emphasizing the importance of good mobility options.',
    },
    {
      measure: 'livability',
      value: 0.6,
      corpus:
        "livability : Livability is the quality or state of being suitable for living, especially with regard to the physical, social, economic, and environmental conditions that affect people's lives. It refers to the extent to which a particular place, community, or environment provides the necessary conditions for people to lead healthy, happy, and fulfilling lives. Livability can be determined by factors such as access to education, healthcare, public services, transportation, recreation, and cultural amenities, as well as by measures of safety, affordability, and environmental sustainability.)",
      reason:
        'The mention of a suitable place to live with considerations for family needs like education and elderly care suggests a strong focus on overall livability.',
    },
  ],

  setInfo: (payload: InfoType) =>
    set((state) => {
      const color = d3
        .scaleOrdinal(ColorScalePalette)
        .domain(payload.measureList);

      return { info: payload, colorScale: color };
    }),
  setStepData: (payload: any) => set((state) => ({ stepData: payload })),
  setMeasureList: (payload: any) => set((state) => ({ measureList: payload })),
}));
