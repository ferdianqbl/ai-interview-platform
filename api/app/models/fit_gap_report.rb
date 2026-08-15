# frozen_string_literal: true

class FitGapReport < ApplicationRecord
  include SessionTenantScoped

  FIT_RESULTS = %w[match gap exceed not_assessed].freeze

  belongs_to :portfolio
  belongs_to :vacancy

  scoped_to_tenant_through portfolio: :session

  validates :skill_comparisons, presence: true
end
