import { DisplayDurationPipe } from './display-duration.pipe';

describe('DisplayDurationPipe', () => {
  it('create an instance', () => {
    const pipe = new DisplayDurationPipe();
    expect(pipe).toBeTruthy();
  });

  it('shows remainder of the duration less than hours as xxm', () => {
    const pipe = new DisplayDurationPipe();
    expect(pipe.transform(33)).toBe('33m');
  })

  it('shows the hours of a duration as 1h', () => {
    const pipe = new DisplayDurationPipe();
    expect(pipe.transform(60)).toBe('1h');
  })
});
