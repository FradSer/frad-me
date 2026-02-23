Feature: WebXR Fragment Shader Logic
  As a developer using the WebXR instancing system
  I want to ensure the fragment shader logic works correctly
  So that colors, opacity, and visual effects render as expected

  Scenario Outline: View opacity mixes correctly based on uViewMode
    Given vertex opacity is 0.9
    And texture alpha is 0.8
    And uOpacity uniform is 0.7
    And vOpacity varying is <vOpacity>
    When calculating final opacity
    Then the result should be 0.8 * 0.7 * <vOpacity>

    Examples:
      | vOpacity |
      | 0.5      |
      | 1.0      |
      | 0.0      |

  Scenario Outline: Hover fade effect applies correctly
    Given glow intensity is 0.3
    And hover state is <hovered>
    And texture color is (1.0, 0.0, 0.0)
    And glow color is (0.0, 0.5, 1.0)
    When calculating final color with hover
    Then the result should mix texture and glow by <amount>

    Examples:
      | hovered | amount |
      | 0.0     | 0.0    |
      | 1.0     | 0.3    |

  Scenario Outline: Glow color mixes correctly
    Given texture color is <texR>, <texG>, <texB>
    And glow color is (0.3, 0.3, 1.0)
    And glow intensity is 0.3
    And hovered state is 1.0
    When calculating final color
    Then red channel should be <texR> * 0.7 + 0.3 * 0.09
    And green channel should be <texG> * 0.7 + 0.3 * 0.09
    And blue channel should be <texB> * 0.7 + 1.0 * 0.3

    Examples:
      | texR | texG | texB |
      | 1.0  | 0.0  | 0.0  |
      | 0.0  | 1.0  | 0.0  |

  Scenario Outline: Alpha discard works below threshold
    Given alpha discard threshold is 0.01
    When texture alpha is <alpha>
    Then fragment should be discarded if <discarded>

    Examples:
      | alpha | discarded |
      | 0.0   | true      |
      | 0.005 | true      |
      | 0.01  | false     |
      | 0.5   | false     |

  Scenario Outline: Texture sampling with adjusted UV
    Given base UV is <u>, <v>
    And UV offset is <offsetU>, <offsetV>
    When calculating final UV coordinates
    Then result should be (<u> + <offsetU>, <v> + <offsetV>)

    Examples:
      | u    | v    | offsetU | offsetV |
      | 0.0  | 0.0  | 0.5     | 0.0     |
      | 0.5  | 0.5  | 0.0     | 0.5     |
      | 0.25 | 0.75 | 0.25    | 0.0     |

  Scenario Outline: Final opacity combines multiple factors
    Given texture alpha is <texAlpha>
    And uOpacity uniform is <uOpacity>
    And vOpacity varying is <vOpacity>
    When calculating final opacity
    Then result should be <texAlpha> * <uOpacity> * <vOpacity>

    Examples:
      | texAlpha | uOpacity | vOpacity | expected |
      | 0.8      | 0.9      | 1.0      | 0.72     |
      | 1.0      | 0.5      | 0.5      | 0.25     |
      | 0.5      | 1.0      | 0.0      | 0.0      |