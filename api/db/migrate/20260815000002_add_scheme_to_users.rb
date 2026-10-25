# frozen_string_literal: true

class AddSchemeToUsers < ActiveRecord::Migration[7.0]
  def change
    unless column_exists?(:users, :scheme)
      add_column :users, :scheme, :string, default: 'test-corp', null: false
    end
  end
end
